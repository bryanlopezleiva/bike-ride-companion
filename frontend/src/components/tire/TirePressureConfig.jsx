import {
  calculatePSI,
  getPSISummary,
  getPSIWarning,
  ROAD_TYPE_LABELS,
} from "../../utils/psiFormula";
import RoadTypeToggle from "./RoadTypeToggle";

function NumberField({ id, label, value, min, max, step = 1, unit, onChange }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
        />
        <span className="ml-2 text-xs text-gray-400">{unit}</span>
      </div>
    </label>
  );
}

export default function TirePressureConfig({
  roadType,
  onRoadTypeChange,
  settings,
  onSettingsChange,
}) {
  const psi = calculatePSI(
    settings.riderWeightLbs,
    settings.bikeWeightLbs,
    settings.tireCondition,
    roadType,
    settings.tireWidthMm,
    settings.wheelDiameter,
    settings.tireType,
    settings.bikeType,
  );
  const warning = getPSIWarning(psi.front, psi.rear, settings.tireType);
  const totalSystemWeight = settings.riderWeightLbs + settings.bikeWeightLbs;

  const updateSetting = (key, value) => {
    onSettingsChange((current) => ({
      ...current,
      [key]: Number.isNaN(value) ? current[key] : value,
    }));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">
        Tire Pressure Configuration
      </h2>

      <div className="mt-4">
        <RoadTypeToggle selected={roadType} onChange={onRoadTypeChange} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <NumberField
          id="rider-weight"
          label="Rider"
          value={settings.riderWeightLbs}
          min={80}
          max={300}
          unit="lb"
          onChange={(value) => updateSetting("riderWeightLbs", value)}
        />
        <NumberField
          id="bike-weight"
          label="Bike"
          value={settings.bikeWeightLbs}
          min={10}
          max={80}
          unit="lb"
          onChange={(value) => updateSetting("bikeWeightLbs", value)}
        />
        <NumberField
          id="tire-width"
          label="Tire width"
          value={settings.tireWidthMm}
          min={23}
          max={60}
          unit="mm"
          onChange={(value) => updateSetting("tireWidthMm", value)}
        />
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            System weight
          </p>
          <p className="mt-2 text-sm font-bold text-gray-900">
            {totalSystemWeight} lb
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-500">
              Recommended
            </p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {ROAD_TYPE_LABELS[roadType]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">
              {psi.front} / {psi.rear}
            </p>
            <p className="text-xs text-blue-600">front / rear PSI</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-blue-700">
          {getPSISummary(psi.front, psi.rear, roadType)}
        </p>
        {warning ? (
          <p className="mt-2 text-xs font-medium text-blue-800">{warning}</p>
        ) : null}
      </div>
    </div>
  );
}
