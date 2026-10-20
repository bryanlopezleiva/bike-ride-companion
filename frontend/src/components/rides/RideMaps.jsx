import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { getGpsPointsPreview } from "../../services/ridesApi";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function validCoordinates(points = []) {
  return points.filter(
    (point) =>
      Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
  );
}

function FitToPoints({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 15 });
    }
  }, [map, points]);

  return null;
}

function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return undefined;

    const layer = L.heatLayer(points, {
      radius: 19,
      blur: 15,
      maxZoom: 16,
      minOpacity: 0.35,
      gradient: {
        0.2: "#38bdf8",
        0.45: "#34d399",
        0.68: "#facc15",
        0.86: "#fb923c",
        1: "#e11d48",
      },
    }).addTo(map);

    return () => map.removeLayer(layer);
  }, [map, points]);

  return null;
}

function MapFrame({ children, center = [39.5, -98.35], zoom = 4, points = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="z-0 h-[360px] w-full md:h-[440px]"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {points.length > 0 ? <FitToPoints points={points} /> : null}
        {children}
      </MapContainer>
    </div>
  );
}

export function RideRouteMap({ gpsPoints = [], rideName = "Ride" }) {
  const coordinates = useMemo(
    () =>
      validCoordinates(gpsPoints).map((point) => [
        point.latitude,
        point.longitude,
      ]),
    [gpsPoints],
  );

  if (coordinates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        This ride has no GPS route to display.
      </div>
    );
  }

  return (
    <MapFrame points={coordinates}>
      {coordinates.length > 1 ? (
        <Polyline
          positions={coordinates}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.9 }}
        />
      ) : null}
      <CircleMarker
        center={coordinates[0]}
        radius={7}
        pathOptions={{ color: "white", weight: 2, fillColor: "#16a34a", fillOpacity: 1 }}
      >
        <Popup>{rideName} start</Popup>
      </CircleMarker>
      {coordinates.length > 1 ? (
        <CircleMarker
          center={coordinates[coordinates.length - 1]}
          radius={7}
          pathOptions={{ color: "white", weight: 2, fillColor: "#dc2626", fillOpacity: 1 }}
        >
          <Popup>{rideName} finish</Popup>
        </CircleMarker>
      ) : null}
    </MapFrame>
  );
}

export function RideHeatmap({ rides }) {
  const [heatPoints, setHeatPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    if (rides.length === 0) {
      setHeatPoints([]);
      setLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setLoading(true);
    setError("");
    Promise.all(rides.map((ride) => getGpsPointsPreview(ride.id, 20)))
      .then((ridePoints) => {
        if (!isCurrent) return;
        setHeatPoints(
          ridePoints
            .flatMap(validCoordinates)
            .map((point) => [point.latitude, point.longitude, 0.75]),
        );
      })
      .catch(() => {
        if (isCurrent) setError("Could not load ride GPS points for the heatmap.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [rides]);

  if (loading) {
    return <p className="text-sm text-gray-500">Building your ride heatmap…</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (heatPoints.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <p className="font-medium text-gray-700">No GPS routes to map yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Import rides recorded with GPS to build your personal heatmap.
        </p>
      </div>
    );
  }

  const boundsPoints = heatPoints.map(([latitude, longitude]) => [latitude, longitude]);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your ride heatmap</h2>
          <p className="mt-1 text-sm text-gray-500">
            Brighter areas show where your rides overlap most.
          </p>
        </div>
        <span className="shrink-0 text-xs text-gray-400">
          {rides.length} {rides.length === 1 ? "ride" : "rides"}
        </span>
      </div>
      <MapFrame points={boundsPoints}>
        <HeatLayer points={heatPoints} />
      </MapFrame>
      <p className="text-xs text-gray-400">
        Map tiles © OpenStreetMap contributors
      </p>
    </section>
  );
}
