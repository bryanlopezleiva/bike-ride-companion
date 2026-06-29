const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export async function searchLocation(query) {
  const response = await fetch(
    buildUrl(GEOCODING_URL, {
      name: query,
      count: 1,
      language: "en",
      format: "json",
    }),
  );

  if (!response.ok) throw new Error("Failed to search location");

  const data = await response.json();
  const location = data.results?.[0];

  if (!location) throw new Error("No matching location found");

  return {
    id: location.id,
    name: location.name,
    admin1: location.admin1,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

// fetches forecast for given coordinates
export async function getRideForecast({ latitude, longitude }) {
  const response = await fetch(
    buildUrl(FORECAST_URL, {
      latitude,
      longitude,
      current:
        "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,uv_index",
      hourly:
        "temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code",
      forecast_hours: 12,
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "auto",
    }),
  );
  if (!response.ok) throw new Error("Failed to load forecast");
  return response.json();
}

// maps Open-Meteo weather codes to descriptions
export function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] ?? "Unknown";
}

// converts wind degrees to cardinal direction
export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return "--";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
