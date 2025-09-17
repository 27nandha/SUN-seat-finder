import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBus,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaClock,
  FaSearch,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import useDebounce from "../hooks/useDebounce";

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const navigate = useNavigate();

  // Debounced inputs to control API calls
  const debouncedStart = useDebounce(start, 500);
  const debouncedEnd = useDebounce(end, 500);

  // Fetch suggestions from backend
  const fetchSuggestions = async (query, field) => {
    if (query.length > 2) {
      setLoadingSuggestions(true);
      setSuggestionError(false);
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_API_URL ||
            "https://sun-seat-finder.onrender.com"
          }/autocomplete?q=${encodeURIComponent(query)}`
        );
        setSuggestions(data);
        setActiveField(field);
      } catch (err) {
        console.error("Suggestion fetch error", err.message);
        setSuggestionError(true);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Trigger only when debouncedStart changes
  useEffect(() => {
    if (debouncedStart && activeField === "start") {
      fetchSuggestions(debouncedStart, "start");
    }
  }, [debouncedStart]);

  // Trigger only when debouncedEnd changes
  useEffect(() => {
    if (debouncedEnd && activeField === "end") {
      fetchSuggestions(debouncedEnd, "end");
    }
  }, [debouncedEnd]);

  const handleSelect = (place) => {
    if (activeField === "start") setStart(place.display_name);
    if (activeField === "end") setEnd(place.display_name);
    setSuggestions([]);
    setSuggestionError(false);
  };

  // Auto detect current location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_API_URL ||
              "https://sun-seat-finder.onrender.com"
            }/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          if (data && data.display_name) {
            setStart(data.display_name);
          } else {
            alert("Could not fetch address");
          }
        } catch (err) {
          console.error("Reverse geocode error", err.message);
          alert("Could not get your location. Please enter manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        alert("Could not access your location. Please enter manually.");
      }
    );
  };

  // Submit seat calculation form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "https://sun-seat-finder.onrender.com"
        }/find-seat`,
        { start, end, time }
      );
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
            <FaBus className="text-4xl text-white" />
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
          {/* Start Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Point
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full pl-12 pr-12 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your starting location"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setActiveField("start");
                }}
              />
              <button
                type="button"
                onClick={detectCurrentLocation}
                disabled={detectingLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors duration-200 disabled:opacity-50"
                title="Use my location"
              >
                {detectingLocation ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <HiLocationMarker className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Suggestions dropdown */}
            {activeField === "start" &&
              (loadingSuggestions ||
                suggestionError ||
                suggestions.length > 0) && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-10">
                  {loadingSuggestions && (
                    <li className="px-4 py-3 text-center text-gray-500">
                      <FaSpinner className="animate-spin inline mr-2" />
                      Loading suggestions...
                    </li>
                  )}
                  {suggestionError && !loadingSuggestions && (
                    <li className="px-4 py-3 text-center text-red-500">
                      <FaExclamationCircle className="inline mr-2" />
                      Could not load suggestions
                    </li>
                  )}
                  {!loadingSuggestions &&
                    !suggestionError &&
                    suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-0"
                        onClick={() => handleSelect(s)}
                      >
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{s.display_name}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
          </div>

          {/* Swap button */}
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
              <FaExchangeAlt className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              Swap locations
            </button>
          </div>

          {/* End Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full pl-12 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Where are you going?"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setActiveField("end");
                }}
              />
            </div>

            {/* Suggestions dropdown */}
            {activeField === "end" &&
              (loadingSuggestions ||
                suggestionError ||
                suggestions.length > 0) && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-10">
                  {loadingSuggestions && (
                    <li className="px-4 py-3 text-center text-gray-500">
                      <FaSpinner className="animate-spin inline mr-2" />
                      Loading suggestions...
                    </li>
                  )}
                  {suggestionError && !loadingSuggestions && (
                    <li className="px-4 py-3 text-center text-red-500">
                      <FaExclamationCircle className="inline mr-2" />
                      Could not load suggestions
                    </li>
                  )}
                  {!loadingSuggestions &&
                    !suggestionError &&
                    suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-0"
                        onClick={() => handleSelect(s)}
                      >
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{s.display_name}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Time
            </label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="datetime-local"
                className="w-full pl-12 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading || !start || !end || !time}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5" />
                Finding...
              </>
            ) : (
              <>
                <FaSearch className="w-5 h-5" />
                Find My Perfect Seat
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
