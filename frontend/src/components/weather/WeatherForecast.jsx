import { useEffect, useState } from "react";
import {
  getRideForecast,
  searchLocation,
  getWeatherDescription,
  getWindDirection,
} from "../../services/weatherApi";

const DEFAULT_LOCATION = "Pasadena, California";

function rideGuidance(current, firstHour) {
  const windSpeed = current.wind_speed_10m ?? 0;
  const gusts = current.wind_gusts_10m ?? 0;
  const rainChance = firstHour?.precipitation_probability ?? 0;
  const temperature = current.temperature_2m ?? 0;

  if (gusts >= 30) return "Gusty conditions. Consider a sheltered route.";
  if (windSpeed >= 18) return "Expect strong wind exposure on open roads.";
  if (rainChance >= 50) return "Rain risk is elevated. Pack layers and lights.";
  if (temperature <= 40) return "Cold start. Warm up gently and cover hands.";
  if (temperature >= 90) return "Hot conditions. Plan extra hydration.";
  return "Good riding window based on current conditions.";
}

export default function WeatherForecast() {
  const [query, setQuery] = useState(DEFAULT_LOCATION);
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadForecast = async (locationQuery) => {
    setLoading(true);
    setError("");
    try {
      const nextLocation = await searchLocation(locationQuery);
      const nextForecast = await getRideForecast(nextLocation);
      setLocation(nextLocation);
      setForecast(nextForecast);
    } catch (err) {
      console.error("Weather forecast failed:", err);
      setError(err.message || "Could not load weather forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    searchLocation(DEFAULT_LOCATION)
      .then((nextLocation) =>
        getRideForecast(nextLocation).then((nextForecast) => {
          if (!isCurrent) return;
          setLocation(nextLocation);
          setForecast(nextForecast);
        }),
      )
      .catch((err) => {
        console.error("Weather forecast failed:", err);
        if (isCurrent) {
          setError(err.message || "Could not load weather forecast");
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) loadForecast(query.trim());
  };

  const current = forecast?.current;
  const hourly = forecast?.hourly;
  const firstHour = hourly
    ? { precipitation_probability: hourly.precipitation_probability?.[0] }
    : null;

  return (
    <section className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Weather & Wind
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {location
              ? [location.name, location.admin1].filter(Boolean).join(", ")
              : "Enter a location"}
          </p>
        </div>
        {current && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(current.temperature_2m)}°
            </p>
            <p className="text-xs text-gray-400">
              {getWeatherDescription(current.weather_code)}
            </p>
          </div>
        )}
      </div>

      {/* search input */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="City, State (e.g. Pasadena, California)"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "..." : "Go"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {current && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Wind
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {Math.round(current.wind_speed_10m)} mph
              </p>
              <p className="text-xs text-gray-500">
                {getWindDirection(current.wind_direction_10m)} ·{" "}
                {current.wind_direction_10m}°
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Gusts
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {Math.round(current.wind_gusts_10m)} mph
              </p>
              <p className="text-xs text-gray-500">10 m forecast</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Feels like
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {Math.round(current.apparent_temperature)}°
              </p>
              <p className="text-xs text-gray-500">Fahrenheit</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Rain chance
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {firstHour?.precipitation_probability ?? "--"}%
              </p>
              <p className="text-xs text-gray-500">next hour</p>
            </div>
          </div>

          <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {rideGuidance(current, firstHour)}
          </p>
        </>
      )}

      {loading && !current && (
        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-400">
          Loading forecast...
        </p>
      )}
    </section>
  );
}
