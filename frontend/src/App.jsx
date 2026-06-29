import { useEffect, useState } from "react";
import TirePressureConfig from "./components/tire/TirePressureConfig";
import FileImport from "./components/rides/FileImport";
import RideCard from "./components/rides/RideCard";
import RideDetail from "./components/rides/RideDetail";
import WeatherForecast from "./components/weather/WeatherForecast";
import { getAllRides, getRideById } from "./services/ridesApi";

const DEFAULT_PSI_SETTINGS = {
  riderWeightLbs: 165,
  bikeWeightLbs: 22,
  tireCondition: 8,
  tireWidthMm: 32,
  wheelDiameter: "700c",
  tireType: "tubeless",
  bikeType: "gravel",
};

export default function App() {
  const [rides, setRides] = useState([]);
  const [roadType, setRoadType] = useState("smooth");
  const [psiSettings, setPsiSettings] = useState(DEFAULT_PSI_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fetchRidesHistory = () => {
    getAllRides()
      .then(setRides)
      .catch((err) => console.error("Backend fetch failed:", err))
      .finally(() => setLoading(false));
  };

  const handleSelectRide = (id) => {
    setSelectedRideId(id);
    setSelectedRide(null);
    setDetailError("");
    setDetailLoading(true);
  };

  const handleCloseRideDetail = () => {
    setSelectedRideId(null);
    setSelectedRide(null);
    setDetailError("");
    setDetailLoading(false);
  };

  // Function to pull latest data from Spring Boot
  const loadRidesHistory = () => {
    setLoading(true);
    fetchRidesHistory();
  };

  useEffect(() => {
    fetchRidesHistory();
  }, []);

  useEffect(() => {
    if (!selectedRideId) return;

    let isCurrent = true;

    getRideById(selectedRideId)
      .then((ride) => {
        if (isCurrent) setSelectedRide(ride);
      })
      .catch((err) => {
        console.error("Ride detail fetch failed:", err);
        if (isCurrent) {
          setSelectedRide(null);
          setDetailError("Could not load ride details. Check the backend.");
        }
      })
      .finally(() => {
        if (isCurrent) setDetailLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedRideId]);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <header className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Bike Ride Companion
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your telemetry, pressure analytics, and conditions.
        </p>
      </header>

      {/* Ride Importer */}
      <section>
        <FileImport onUploadSuccess={loadRidesHistory} />
      </section>

      {/* Main Grid: Split between Calculator Config & Ride History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Controls */}
        <div className="space-y-6">
          <WeatherForecast />
          <TirePressureConfig
            roadType={roadType}
            onRoadTypeChange={setRoadType}
            settings={psiSettings}
            onSettingsChange={setPsiSettings}
          />
        </div>

        {/* Right Side: History Feed or Ride Detail */}
        <div className="space-y-4">
          {selectedRideId ? (
            detailLoading ? (
              <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">
                Loading ride detail...
              </p>
            ) : detailError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                {detailError}
              </div>
            ) : selectedRide ? (
              <RideDetail
                ride={selectedRide}
                roadType={roadType}
                psiSettings={psiSettings}
                onBack={handleCloseRideDetail}
              />
            ) : null
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activities
              </h2>

              {loading ? (
                <p className="text-sm text-gray-400">Loading history feed...</p>
              ) : rides.length === 0 ? (
                <p className="text-sm text-gray-400 bg-gray-50 p-4 rounded-xl text-center">
                  No rides imported yet. Drop a .FIT file above!
                </p>
              ) : (
                <div className="space-y-4">
                  {rides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onSelect={handleSelectRide}
                      isSelected={selectedRideId === ride.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
