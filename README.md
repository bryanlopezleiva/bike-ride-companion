# Bike Ride Companion

A personal cycling dashboard for importing Garmin `.FIT` activities, reviewing ride metrics, viewing ride routes, and seeing where rides overlap on a heatmap. It also includes a tire-pressure estimator and a weather forecast.

## Features

- Import Garmin `.FIT` files and parse ride and GPS data.
- Review distance, duration, speed, elevation, heart rate, cadence, power, and temperature.
- View an individual ride route with start and finish markers.
- View a heatmap of sampled GPS points across all imported rides.
- Estimate tire pressure based on rider and bike setup and selected road type.
- View weather forecasts.

Map tiles are provided by OpenStreetMap and require an internet connection. The map displays OpenStreetMap attribution.

## Run with Docker Desktop

### Requirements

- Docker Desktop with Docker Compose enabled.
- An internet connection for the map tiles and the initial image builds.

From the repository root, run:

```sh
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000). Docker Compose starts the frontend, Spring Boot API, and PostgreSQL database. You can see their logs and status in Docker Desktop.

To stop the containers while keeping the database, run:

```sh
docker compose down
```

Ride data is stored in the `postgres_data` Docker volume. **Do not run `docker compose down -v` unless you intend to permanently delete the local database and its rides.**

## Technology

- Frontend: React, Vite, Tailwind CSS, React Leaflet, and Leaflet.heat.
- Backend: Java 21, Spring Boot, and the Garmin FIT SDK.
- Database: PostgreSQL 16.
- Local orchestration: Docker Compose.

## Repository layout

```text
frontend/            React application and Nginx configuration
fit-parser-service/  Spring Boot API and FIT file parser
docker-compose.yml   Local frontend, backend, and PostgreSQL stack
```

## API routes

- `GET /api/rides` — list rides.
- `POST /api/rides/upload` — upload a FIT file using the `file` form field.
- `GET /api/rides/{id}` — ride detail, including GPS points.
- `GET /api/rides/{id}/gps` — all GPS points for a ride.
- `GET /api/rides/{id}/gps/preview?sampleRate=20` — sampled GPS points.
- `DELETE /api/rides/{id}` — delete a ride and its GPS points.

## Configuration

The root Compose file contains convenient local development defaults. In particular, its PostgreSQL username and password are for local use only; use managed secrets and a private database connection for any hosted deployment.

- `APP_FIT_TIME_ZONE` — IANA timezone used to convert FIT timestamps, for example `America/Los_Angeles`. The root Compose setup uses Pacific time. The backend falls back to UTC if this setting is omitted.
- `VITE_API_BASE_URL` — frontend API base URL. It is intentionally absent from the Docker build context so the Docker frontend uses same-origin `/api` requests through Nginx.
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` — backend database connection settings.

## Hosting

The app is currently configured for a local Docker Compose stack, not public deployment. A no-cost hobby setup could use:

- **Cloudflare Pages** for the Vite frontend (`frontend` as the project root, `npm run build` as the build command, and `dist` as the output directory).
- **Render Free Web Service** for the Spring Boot API, built from `fit-parser-service/Dockerfile`.
- **Neon Free** for managed PostgreSQL.

For that split setup, the frontend needs its `VITE_API_BASE_URL` set to the API URL, and the backend needs the frontend origin allowed by CORS. The backend must also bind to the port supplied by its host. The local Nginx proxy and localhost-only CORS settings are not a hosted setup by themselves.

The free tiers have limits: Render's free web service sleeps after 15 minutes without traffic and can take about a minute to wake; Neon Free includes 1 GB of storage and 100 compute-hours per month per project. These limits and plans can change. [Render free tier details](https://render.com/docs/free) · [Neon pricing](https://neon.com/pricing) · [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/).

**Privacy and access:** the API currently has no authentication. Anyone who can reach a deployed API could access ride data or call its delete endpoint. FIT files can reveal precise routes and start/end locations. Add authentication or restrict access before exposing personal rides publicly.
