import {
  calculatePSI,
  getPSISummary,
  getPSIWarning,
  ROAD_TYPE_LABELS,
} from "../../utils/psiFormula";

const DEFAULT_PSI_INPUTS = {
  riderWeightLbs: 165,
  bikeWeightLbs: 22,
  tireCondition: 8,
  tireWidthMm: 32,
  wheelDiameter: "700c",
  tireType: "tubeless",
  bikeType: "gravel",
};

function formatValue(value, unit = "") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value}${unit}`;
}

function getAverageTemperature(gpsPoints = []) {
  const temperatures = gpsPoints
    .map((point) => point.temperatureFahrenheit)
    .filter((temp) => typeof temp === "number");

  if (temperatures.length === 0) return null;

  const total = temperatures.reduce((sum, temp) => sum + temp, 0);
  return Math.round(total / temperatures.length);
}

export default function RideDetail({
  ride,
  roadType,
  psiSettings = DEFAULT_PSI_INPUTS,
  onBack,
}) {
  const averageTemperature = getAverageTemperature(ride.gpsPoints);
  const psi = calculatePSI(
    psiSettings.riderWeightLbs,
    psiSettings.bikeWeightLbs,
    psiSettings.tireCondition,
    roadType,
    psiSettings.tireWidthMm,
    psiSettings.wheelDiameter,
    psiSettings.tireType,
    psiSettings.bikeType,
  );
  const psiWarning = getPSIWarning(psi.front, psi.rear, psiSettings.tireType);

  const stats = [
    {
      label: "Distance",
      value: formatValue(ride.totalDistanceMiles, " mi"),
    },
    {
      label: "Duration",
      value: ride.formattedDuration ?? "--",
    },
    {
      label: "Elevation",
      value: formatValue(ride.totalAscentFeet, " ft"),
    },
    {
      label: "Temperature",
      value: formatValue(averageTemperature, " F"),
    },
    {
      label: "Calories",
      value: formatValue(ride.totalCalories),
    },
    {
      label: "Average Speed",
      value: formatValue(ride.avgSpeedMph, " mph"),
    },
  ];

  return (
    <article className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Ride detail
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {ride.rideName}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(ride.startTime).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 py-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-500">
              Tire pressure estimate
            </p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {ROAD_TYPE_LABELS[roadType]} ·{" "}
              {psiSettings.riderWeightLbs + psiSettings.bikeWeightLbs} lb
              system
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900">
              {psi.front} / {psi.rear}
            </p>
            <p className="text-xs text-blue-600">front / rear PSI</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-blue-700">
          {getPSISummary(psi.front, psi.rear, roadType)}
        </p>
        {psiWarning ? (
          <p className="mt-2 text-xs font-medium text-blue-800">
            {psiWarning}
          </p>
        ) : null}
      </div>
    </article>
  );
}
