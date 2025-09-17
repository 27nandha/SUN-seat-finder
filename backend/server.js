import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import SunCalc from "suncalc";

const app = express();
app.use(cors());
app.use(express.json());

// Geocode city/place name -> {lat, lng}
async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    place
  )}`;
  const r = await fetch(url, { headers: { "User-Agent": "BestSeatFinder/1.0" } });
  const data = await r.json();
  if (!data.length) throw new Error(`Could not geocode: ${place}`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

app.post("/find-seat", async (req, res) => {
  try {
    const { start, end, time } = req.body;
    const travelTime = time ? new Date(time) : new Date();

    const startCoords = await geocode(start);
    const endCoords = await geocode(end);

    // Call OSRM for route
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.routes?.length) throw new Error("No route found");

    const coords = data.routes[0].geometry.coordinates;

    const [lng1, lat1] = coords[0];
    const [lng2, lat2] = coords[1];

    // Heading
    const heading = (Math.atan2(lng2 - lng1, lat2 - lat1) * 180) / Math.PI;

    // Sun position
    const sun = SunCalc.getPosition(travelTime, lat1, lng1);
    const azimuthDeg = (sun.azimuth * 180) / Math.PI + 180;

    // Decide exposure %
    const relativeAngle = (azimuthDeg - heading + 360) % 360;
    const exposure = {
      LEFT: relativeAngle > 180 ? 100 : 100 - Math.round((relativeAngle / 180) * 100),
      RIGHT: relativeAngle > 180 ? 100 - Math.round(((relativeAngle - 180) / 180) * 100) : 100,
    };

    const side = exposure.LEFT > exposure.RIGHT ? "LEFT" : "RIGHT";

    res.json({
      suggestion: `Sit on the ${side} side to avoid sunlight ☀️`,
      heading: heading.toFixed(2),
      sunAzimuth: azimuthDeg.toFixed(2),
      exposure,
      route: coords, // polyline for frontend
    });
  } catch (err) {
    console.error("❌", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.listen(5000, () =>
  console.log("✅ Backend running at http://localhost:5000")
);