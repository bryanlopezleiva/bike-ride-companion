import { ROAD_TYPE_LABELS } from "../../utils/psiFormula";

const ROAD_TYPES = [
  { key: "smooth", hint: "Paved roads" },
  { key: "mixed", hint: "Some rough sections" },
  { key: "gravel", hint: "Dirt and gravel" },
  { key: "wet", hint: "Rain or puddles" },
];

const baseClass =
  "flex flex-col items-center gap-1 px-3 py-3 rounded-lg border text-sm transition-all duration-150";
const selectedClass = "border-blue-500 bg-blue-50 text-blue-700";
const unselectedClass =
  "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50";

export default function RoadTypeToggle({ selected, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-3">Road type</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROAD_TYPES.map(({ key, hint }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`${baseClass} ${isSelected ? selectedClass : unselectedClass}`}
            >
              <span className="font-medium">{ROAD_TYPE_LABELS[key]}</span>
              <span
                className={`text-xs ${isSelected ? "text-blue-500" : "text-gray-400"}`}
              >
                {hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
