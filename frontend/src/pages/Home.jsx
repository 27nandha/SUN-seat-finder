// Home.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${query}`,
          { headers: { "User-Agent": "BestSeatFinder/1.0" } }
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
            <p className="text-gray-700 font-medium">Finding the best seat...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          
            Best Seat Finder
          </h1>
          <p className="text-gray-600">Find the most comfortable seat for your journey</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20 space-y-6"
        >
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Point
            </label>
            <input
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your starting location"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                fetchSuggestions(e.target.value, "start");
              }}
            />
            {activeField === "start" && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto z-10">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                    onClick={() => handleSelect(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
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
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                    onClick={() => handleSelect(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {loading ? "Finding..." : "Find My Perfect Seat"}
          </button>
        </form>
      </div>
    </div>
  );
}