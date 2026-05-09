# Transport Seed Data

These files define the starter Batangas transport network used by the backend.

Files:
- `stops.json`: all known stops with coordinates
- `routes.json`: routes and their ordered stop lists
- `vehicles.json`: active vehicles, assigned routes, and last known coordinates

Rules:
- Stop names in `routes.json` must exactly match `stops.json`
- `routeCode` in `vehicles.json` must exactly match a route `code`
- Coordinates use decimal latitude/longitude

Import behavior:
- Seed data loads automatically on startup only when the transport tables are empty
- After you have production data, you can edit these files and reload into a fresh database

Suggested next expansion:
- Add more Batangas stops
- Add more jeepney/tricycle routes
- Add more vehicles with real driver assignments
