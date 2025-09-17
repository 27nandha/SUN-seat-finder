// SeatDiagram.jsx
export default function SeatDiagram({ recommendation }) {
  const isLeftRecommended = recommendation.includes("LEFT");
  const isRightRecommended = recommendation.includes("RIGHT");

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 max-w-sm mx-auto">
      <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
        Bus Seat Layout
      </h3>
      <div className="relative">
        <div className="flex gap-3 h-32">
          <div
            className={`flex-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              isLeftRecommended
                ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className="text-xs font-medium mb-1">LEFT</span>
            <span className="text-2xl">{isLeftRecommended ? "✓" : "×"}</span>
            {isLeftRecommended && (
              <span className="text-xs mt-1 font-medium">Best Choice</span>
            )}
          </div>

          <div className="w-px bg-gray-300"></div>

          <div
            className={`flex-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              isRightRecommended
                ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className="text-xs font-medium mb-1">RIGHT</span>
            <span className="text-2xl">{isRightRecommended ? "✓" : "×"}</span>
            {isRightRecommended && (
              <span className="text-xs mt-1 font-medium">Best Choice</span>
            )}
          </div>
        </div>

        {/* Aisle indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
            AISLE
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {isLeftRecommended &&
            "Choose a left window seat for minimal sun exposure"}
          {isRightRecommended &&
            "Choose a right window seat for minimal sun exposure"}
        </p>
      </div>
    </div>
  );
}
