/**
 * Biyahenyo — Defense Demo Simulation Data
 *
 * DEMO_MODE is read from the .env variable VITE_DEMO_MODE.
 * Set VITE_DEMO_MODE=true for defense, VITE_DEMO_MODE=false for production.
 *
 * When DEMO_MODE is active:
 *  - GPS auto-tracking is suppressed on the Driver Dashboard.
 *  - The driver manually triggers checkpoint buttons to push live updates.
 *  - All existing backend APIs and passenger-side polling remain active.
 *  - Passenger sees smooth jeepney animation and trip stages.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

/**
 * DEMO SCENARIO:
 * Passenger: BSU Alangilan Campus → GCH Gate → Hilltop Road
 * Driver: SM Hypermarket → Near GCH Gate → GCH Gate → Capitolio → Hilltop Road
 * 
 * PASSENGER COORDINATES (current location + route)
 */
export const DEMO_PASSENGER = {
  currentLocation: { lat: 13.7598, lng: 121.0580 }, // BSU Alangilan Campus
  pickupPoint: { lat: 13.7498, lng: 121.0508 },     // GCH Gate
  destination: { lat: 13.7405, lng: 121.0450 },     // Hilltop Road
  
  // Walking segment: BSU to GCH Gate
  walkingRoute: [
    [13.7598, 121.0580], // Start: BSU Alangilan
    [13.7575, 121.0570],
    [13.7550, 121.0545],
    [13.7525, 121.0520],
    [13.7498, 121.0508], // End: GCH Gate
  ],
  walkingTimeMinutes: 8,
  
  // Jeepney segment: GCH Gate to Hilltop Road
  ridingRoute: [
    [13.7498, 121.0508], // Start: GCH Gate
    [13.7480, 121.0490],
    [13.7460, 121.0470],
    [13.7435, 121.0460],
    [13.7405, 121.0450], // End: Hilltop Road
  ],
  ridingTimeMinutes: 15,
};

/**
 * PASSENGER FLOW STEPS
 */
export const DEMO_PASSENGER_STEPS = [
  {
    stepId: 1,
    type: "walking",
    title: "Walk to GCH Gate",
    description: "Walking distance: ~800m",
    estimatedMinutes: 8,
    emoji: "🚶",
    status: "pending",
  },
  {
    stepId: 2,
    type: "waiting",
    title: "Wait for Jeepney",
    description: "Jeepney will arrive at GCH Gate",
    estimatedMinutes: 12,
    emoji: "⏳",
    status: "pending",
  },
  {
    stepId: 3,
    type: "riding",
    title: "Ride to Hilltop Road",
    description: "Ride duration: ~15 minutes",
    estimatedMinutes: 15,
    emoji: "🚌",
    status: "pending",
  },
];

/**
 * ORDERED DRIVER CHECKPOINTS FOR DEMO CONTROL
 * Each button on the Driver Dashboard represents one stage.
 */
export const DEMO_STAGES = [
  {
    id: "sm_hypermarket",
    label: "SM Hypermarket",
    stageLabel: "📍 Starting Point",
    emoji: "🏬",
    lat: 13.7565,
    lng: 121.0558,
    etaMinutes: 12,
    traffic: "MODERATE",
    tripStage: "approaching",
    description: "Driver at SM Hypermarket, heading to pickup point",
  },
  {
    id: "near_gch_gate",
    label: "Near GCH Gate",
    stageLabel: "📍 Close to Pickup",
    emoji: "📍",
    lat: 13.7512,
    lng: 121.0521,
    etaMinutes: 3,
    traffic: "LIGHT",
    tripStage: "near_pickup",
    description: "Driver is very close to GCH Gate",
  },
  {
    id: "gch_gate",
    label: "GCH Gate",
    stageLabel: "✅ Jeepney Arrived",
    emoji: "🚌",
    lat: 13.7498,
    lng: 121.0508,
    etaMinutes: 0,
    traffic: "LIGHT",
    tripStage: "arrived",
    description: "Driver has arrived at pickup point",
  },
  {
    id: "capitolio",
    label: "Capitolio",
    stageLabel: "🚗 En Route",
    emoji: "🏛️",
    lat: 13.7539,
    lng: 121.0536,
    etaMinutes: 7,
    traffic: "MODERATE",
    tripStage: "riding",
    description: "Driver passing through Capitolio on the way to Hilltop Road",
  },
  {
    id: "hilltop_start",
    label: "Hilltop Road",
    stageLabel: "🛣️ Trip Started",
    emoji: "🛣️",
    lat: 13.7405,
    lng: 121.0450,
    etaMinutes: 0,
    traffic: "LIGHT",
    tripStage: "trip_completed",
    description: "Passenger dropped at destination",
  },
];

/**
 * DEMO TRIP DATA
 * Represents the full passenger journey
 */
export const DEMO_TRIP = {
  tripId: "demo-trip-001",
  passengerId: "passenger@demo.local",
  driverId: "driver1",
  title: "BSU Alangilan → Hilltop Road",
  pickupLocation: "GCH Gate",
  dropoffLocation: "Hilltop Road",
  totalEstimatedTime: 35, // walking (8) + waiting (12) + riding (15)
  currentStep: 1,
  completed: false,
  steps: DEMO_PASSENGER_STEPS,
  routePath: [
    ...DEMO_PASSENGER.walkingRoute,
    ...DEMO_PASSENGER.ridingRoute,
  ],
};

/** Fallback center used to seed the map before any location is received */
export const BATANGAS_CENTER = { lat: 13.756, lng: 121.058 };
