import express from "express";
import fetch from "node-fetch"; // To call Nominatim + OSRM
import cors from "cors"; // Allow frontend (React) to talk to backend
import SunCalc from "suncalc"; // Calculate sun position

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 🔎 Geocode a place name (city, address) to { lat, lng } using Nominatim
 */
async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    place
  )}`;
  const r = await fetch(url, {
    headers: { "User-Agent": "BestSeatFinder/1.0" }, // Required by Nominatim
  });
  const data = await r.json();
  if (!data.length) throw new Error(`Could not geocode: ${place}`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

/**
 * 🚍 API: Find best seat suggestion
 * Body: { start: "Chennai", end: "Vellore", time?: "2024-06-07T10:00" }
 */
app.post("/find-seat", async (req, res) => {
  try {
    const { start, end, time } = req.body;
    const travelTime = time ? new Date(time) : new Date();

    if (!start || !end) {
      return res.status(400).json({ error: "Start and end are required." });
    }

    // 1️⃣ Geocode start & destination
    const startCoords = await geocode(start);
    const endCoords = await geocode(end);

    // 2️⃣ Fetch driving route from OSRM free server
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
    const r = await fetch(routeUrl);
    const data = await r.json();
    if (!data.routes?.length) throw new Error("No route found");

    const route = data.routes[0];
    const coords = route.geometry.coordinates;

    // 3️⃣ Derive initial heading (bearing) from first segment of route
    const [lng1, lat1] = coords[0];
    const [lng2, lat2] = coords[1];
    const heading = (Math.atan2(lng2 - lng1, lat2 - lat1) * 180) / Math.PI;

    // 4️⃣ Get sun position at chosen time & location
    const sun = SunCalc.getPosition(travelTime, lat1, lng1);
    const azimuthDeg = (sun.azimuth * 180) / Math.PI + 180;
    const altitudeDeg = (sun.altitude * 180) / Math.PI; // angle above horizon

    let suggestion, exposure, side;

    // 🌙 Special case: If sun is below horizon (night time)
    if (altitudeDeg <= 0) {
      suggestion = "🌙 No sunlight now — sit anywhere you like";
      exposure = { LEFT: 0, RIGHT: 0 };
      side = "ANY";
    } else {
      // 5️⃣ Otherwise calculate exposure and best side
      const relativeAngle = (azimuthDeg - heading + 360) % 360;
      exposure = {
        LEFT:
          relativeAngle > 180
            ? 100
            : 100 - Math.round((relativeAngle / 180) * 100),
        RIGHT:
          relativeAngle > 180
            ? 100 - Math.round(((relativeAngle - 180) / 180) * 100)
            : 100,
      };
      side = exposure.LEFT > exposure.RIGHT ? "LEFT" : "RIGHT";
      suggestion = `Sit on the ${side} side to avoid sunlight ☀️`;
    }

    // 6️⃣ Distance & duration from OSRM
    const dist = route.distance; // meters
    const dur = route.duration; // seconds
    function formatDuration(sec) {
      const h = Math.floor(sec / 3600);
      const m = Math.round((sec % 3600) / 60);
      return `${h > 0 ? h + "h " : ""}${m}m`;
    }

    // ✅ Return JSON to frontend
    res.json({
      suggestion,
      heading: heading.toFixed(2),
      sunAzimuth: azimuthDeg.toFixed(2),
      sunAltitude: altitudeDeg.toFixed(2),
      exposure,
      side,
      route: coords, // array of [lng, lat] for map polyline
      distance: (dist / 1000).toFixed(1), // km
      duration: formatDuration(dur),
    });
  } catch (err) {
    console.error("❌ /find-seat error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * 📍 API: Autocomplete for place names
 * GET /autocomplete?q=vellore
 * Returns top results from Nominatim
 */
app.get("/autocomplete", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
      q
    )}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "BestSeatFinder/1.0" },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("❌ /autocomplete error:", err.message);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// ✨ Reverse geocoding: lat/lon -> place name
app.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon)
      return res.status(400).json({ error: "lat and lon required" });

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "BestSeatFinder/1.0" },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Reverse geocode failed:", err.message);
    res.status(500).json({ error: "Failed to reverse geocode" });
  }
});
// 🚀 Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
