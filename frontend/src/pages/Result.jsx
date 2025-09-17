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
import {
  FaCloudMoon,
  FaSun,
  FaMoon,
  FaCheckCircle,
  FaCompass,
  FaMapMarkerAlt,
  FaClock,
  FaRoute,
  FaArrowLeft,
} from "react-icons/fa";
import { HiSun, HiArrowRight } from "react-icons/hi";
import { BsSunglasses, BsFillSunFill } from "react-icons/bs";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <p className="text-gray-600 text-center mb-4">No results available</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {state.suggestion}
          </h2>

          {/* Extra heading / sun info */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full shadow-sm">
              <FaCompass className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Heading:</span>
              <span className="font-semibold text-gray-900">
                {state.heading}°
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full shadow-sm">
              <HiSun className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700">Sun Position:</span>
              <span className="font-semibold text-gray-900">
                {state.sunAzimuth}°
              </span>
            </div>
          </div>
        </div>

        {/* Conditional: Night vs Day */}
        {state.sunAltitude <= 0 ? (
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaCloudMoon className="text-3xl text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                Night Journey
              </h3>
            </div>
            <p className="text-gray-600">
              Enjoy a cool, comfortable ride — no sunlight to worry about!
            </p>
          </div>
        ) : (
          <>
            {/* Small exposure overview */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">LEFT:</span>
                <span className="flex items-center gap-1">
                  {state.exposure.LEFT > 50 ? (
                    <BsFillSunFill className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <BsSunglasses className="w-4 h-4 text-blue-500" />
                  )}
                  {state.exposure.LEFT}%
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">RIGHT:</span>
                <span className="flex items-center gap-1">
                  {state.exposure.RIGHT > 50 ? (
                    <BsFillSunFill className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <BsSunglasses className="w-4 h-4 text-blue-500" />
                  )}
                  {state.exposure.RIGHT}%
                </span>
              </div>
            </div>

            {/* Exposure bars */}
            <div className="space-y-6 mb-8">
              {/* LEFT bar */}
              <div className={`${bestSide === "LEFT" ? "order-first" : ""}`}>
                <div className="flex justify-between items-center mb-3">
                  <div
                    className={`font-semibold flex items-center gap-3 ${
                      bestSide === "LEFT" ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    <span className="text-lg">LEFT SIDE</span>
                    {bestSide === "LEFT" && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        <FaCheckCircle className="w-3 h-3" />
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {state.exposure.LEFT > 50 ? (
                      <FaSun className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <FaMoon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      bestSide === "LEFT"
                        ? "bg-gradient-to-r from-green-400 to-green-500 shadow-sm"
                        : "bg-gradient-to-r from-yellow-300 to-orange-400"
                    }`}
                    style={{ width: `${state.exposure.LEFT}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {state.exposure.LEFT}% sun exposure
                  </span>
                </div>
              </div>

              {/* RIGHT bar */}
              <div className={`${bestSide === "RIGHT" ? "order-first" : ""}`}>
                <div className="flex justify-between items-center mb-3">
                  <div
                    className={`font-semibold flex items-center gap-3 ${
                      bestSide === "RIGHT" ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    <span className="text-lg">RIGHT SIDE</span>
                    {bestSide === "RIGHT" && (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        <FaCheckCircle className="w-3 h-3" />
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {state.exposure.RIGHT > 50 ? (
                      <FaSun className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <FaMoon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      bestSide === "RIGHT"
                        ? "bg-gradient-to-r from-green-400 to-green-500 shadow-sm"
                        : "bg-gradient-to-r from-yellow-300 to-orange-400"
                    }`}
                    style={{ width: `${state.exposure.RIGHT}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {state.exposure.RIGHT}% sun exposure
                  </span>
                </div>
              </div>
            </div>

            {/* Distance and Duration Info */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <FaRoute className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Distance:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {state.distance} km
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                <FaClock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Duration:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {state.duration}
                </span>
              </div>
            </div>

            {/* Map */}
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
          className="w-full py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Plan Another Journey
        </button>
      </div>
    </div>
  );
}
