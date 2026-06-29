export default function RideCard({ ride, onSelect, isSelected = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ride.id)}
      className={`w-full rounded-xl border p-5 text-left shadow-sm transition-all block my-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{ride.rideName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(ride.startTime).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Distance
          </p>
          <p className="text-base font-bold text-gray-800 mt-1">
            {ride.totalDistanceMiles}{" "}
            <span className="text-xs font-normal text-gray-500">mi</span>
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Duration
          </p>
          <p className="text-base font-bold text-gray-800 mt-1">
            {ride.formattedDuration}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Avg Speed
          </p>
          <p className="text-base font-bold text-gray-800 mt-1">
            {ride.avgSpeedMph}{" "}
            <span className="text-xs font-normal text-gray-500">mph</span>
          </p>
        </div>
      </div>
    </button>
  );
}
