// Result.jsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state)
    return (
      <p className="text-center mt-10 text-gray-600">No results available</p>
    );

  const route = state.route.map(([lng, lat]) => [lat, lng]);
  const bestSide = state.side;
  const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 max-w-2xl w-full border border-white/20">
        <div className="text-center mb-8">
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {state.suggestion}
          </h2>

          {/* Extra heading / sun info */}
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="font-medium">Heading:</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {state.heading}°
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-medium">Sun Position:</span>
              <span className="bg-yellow-100 px-3 py-1 rounded-full">
                {state.sunAzimuth}°
              </span>
            </span>
          </div>
        </div>

        {/* Conditional: Night vs Day */}
        {state.sunAltitude <= 0 ? (
          <p className="text-center text-gray-500 mb-6">
            Enjoy a cool ride 🌙 — no need to worry about sunlight now.
          </p>
        ) : (
          <>
            {/* Small exposure overview */}
            <p className="text-gray-500 mb-4 text-center">
              LEFT ☀️: {state.exposure.LEFT}% | RIGHT 😎: {state.exposure.RIGHT}
              %
            </p>

            {/* Exposure bars */}
            <div className="space-y-6 mb-8">
              {/* LEFT bar */}
              <div className={`${bestSide === "LEFT" ? "order-first" : ""}`}>
                <div className="flex justify-between items-center mb-2">
                  <p
                    className={`font-semibold flex items-center gap-2 ${
                      bestSide === "LEFT" ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    <span>LEFT SIDE</span>
                    {bestSide === "LEFT" && (
                      <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </p>
                  <span className="text-2xl">
                    {state.exposure.LEFT > 50 ? "☀️" : "😎"}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      bestSide === "LEFT"
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gradient-to-r from-yellow-300 to-orange-400"
                    }`}
                    style={{ width: `${state.exposure.LEFT}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {state.exposure.LEFT}% sun exposure
                  </span>
                </div>
              </div>

              {/* RIGHT bar */}
              <div className={`${bestSide === "RIGHT" ? "order-first" : ""}`}>
                <div className="flex justify-between items-center mb-2">
                  <p
                    className={`font-semibold flex items-center gap-2 ${
                      bestSide === "RIGHT" ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    <span>RIGHT SIDE</span>
                    {bestSide === "RIGHT" && (
                      <span className="text-xs bg-green-100 px-2 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </p>
                  <span className="text-2xl">
                    {state.exposure.RIGHT > 50 ? "☀️" : "😎"}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      bestSide === "RIGHT"
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gradient-to-r from-yellow-300 to-orange-400"
                    }`}
                    style={{ width: `${state.exposure.RIGHT}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {state.exposure.RIGHT}% sun exposure
                  </span>
                </div>
              </div>
            </div>

            {/* Map */}
            <p className="text-gray-600 mb-4 text-center">
              Distance: {state.distance} km | Estimated: {state.duration}
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8 border-2 border-gray-100">
              <MapContainer center={route[0]} zoom={10} className="h-80 w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={route} color="#3B82F6" weight={5} />
                <Marker position={route[0]} icon={defaultIcon}>
                  <Popup>Start</Popup>
                </Marker>
                <Marker position={route[route.length - 1]} icon={defaultIcon}>
                  <Popup>Destination</Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
        >
          Plan Another Journey
        </button>
      </div>
    </div>
  );
}
