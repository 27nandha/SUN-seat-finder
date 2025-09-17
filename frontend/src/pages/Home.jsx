// Home.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBus } from "react-icons/fa";

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();

  // fetch place suggestions from Nominatim
  const fetchSuggestions = async (query, field) => {
    setActiveField(field);
    if (query.length > 2) {
      try {
        // Call your backend, not Nominatim directly
        const { data } = await axios.get(
          `http://localhost:5000/autocomplete?q=${encodeURIComponent(query)}`
        );
        setSuggestions(data);
      } catch (err) {
        console.error("Suggestion fetch error", err.message);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (place) => {
    if (activeField === "start") setStart(place.display_name);
    if (activeField === "end") setEnd(place.display_name);
    setSuggestions([]);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const { data } = await axios.get(
          `http://localhost:5000/reverse-geocode?lat=${latitude}&lon=${longitude}`
        );

        // Fill input with the nice address string
        if (data && data.display_name) {
          setStart(data.display_name);
        } else {
          alert("Could not fetch address for your location");
        }
      } catch (err) {
        console.error("Reverse geocode error", err);
        alert("Failed to detect current location");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/find-seat", {
        start,
        end,
        time,
      });
      navigate("/result", { state: data });
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative p-6">
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex items-center space-x-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute inset-0"></div>
            </div>
            <p className="text-gray-700 font-medium">
              Finding the best seat...
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mb-4 shadow-lg">
            <span className="text-4xl">
              <FaBus />
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Best Seat Finder
          </h1>
          <p className="text-gray-600">
            Find the most comfortable seat for your journey
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 space-y-6"
        >
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Point
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-12 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your starting location"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    fetchSuggestions(e.target.value, "start");
                  }}
                />
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  title="Use my location"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              {activeField === "start" && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-10">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-0"
                      onClick={() => handleSelect(s)}
                    >
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="line-clamp-2">{s.display_name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const temp = start;
                  setStart(end);
                  setEnd(temp);
                }}
                className="group px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                Swap locations
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Where are you going?"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  fetchSuggestions(e.target.value, "end");
                }}
              />
              {activeField === "end" && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-10">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-0"
                      onClick={() => handleSelect(s)}
                    >
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="line-clamp-2">{s.display_name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                className="w-full px-4 py-3 pl-12 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <button
            disabled={loading || !start || !end || !time}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Finding...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Find My Perfect Seat
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
