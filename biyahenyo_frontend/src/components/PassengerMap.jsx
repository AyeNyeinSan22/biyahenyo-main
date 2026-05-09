import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { getDriverLocation } from "../api/api";
import { DEMO_MODE, DEMO_PASSENGER } from "../demo/demoData";

const batangasCityCenter = [13.756, 121.058];
const mapStyle = {
  width: "100%",
  height: "100%",
  minHeight: "65vh",
};

const infoCardStyle = {
  padding: "12px 16px",
  borderRadius: "16px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-light)",
  boxShadow: "var(--shadow-sm)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

const driverFallbackId = "driver1";

function buildJeepneyIcon() {
  return L.divIcon({
    className: "",
    html:
      "<div style=\"width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:#FFD000;border:2px solid #1A1C1E;border-radius:12px;box-shadow:0 6px 12px rgba(0,0,0,0.15);font-size:20px;\">🚌</div>",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function buildUserIcon() {
  return L.divIcon({
    className: "",
    html:
      "<div style=\"width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#4A90E2;border:2px solid white;border-radius:50%;box-shadow:0 4px 8px rgba(0,0,0,0.2);font-size:16px;\">👤</div>",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function buildPickupIcon() {
  return L.divIcon({
    className: "",
    html:
      "<div style=\"width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#4CAF50;border:2px solid white;border-radius:50%;box-shadow:0 4px 8px rgba(0,0,0,0.2);font-size:16px;\">📍</div>",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function buildDestinationIcon() {
  return L.divIcon({
    className: "",
    html:
      "<div style=\"width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#FF6B6B;border:2px solid white;border-radius:50%;box-shadow:0 4px 8px rgba(0,0,0,0.2);font-size:16px;\">🎯</div>",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Component to handle map view updates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function PassengerMap({
  driverId: driverIdProp,
  driverPosition: driverPositionProp,
  etaMinutes: etaMinutesProp,
  traffic: trafficProp,
  showDemoRoute = false,
  center: centerProp,
  zoom: zoomProp = 16,
  routePath: routePathProp,
  destinationPosition,
  currentPosition,
  driverLabel = "Jeepney",
}) {
  const driverId = driverIdProp ?? driverFallbackId;
  const [driverLocation, setDriverLocation] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(centerProp ? [centerProp.lat, centerProp.lng] : batangasCityCenter);
  const [etaText, setEtaText] = useState(null);
  const [trafficText, setTrafficText] = useState(null);
  const [statusText, setStatusText] = useState("Connecting to live driver feed...");
  
  const markerRef = useRef(null);
  const markerPositionRef = useRef(null);
  const previousLocationRef = useRef(null);
  const animationRef = useRef(null);

  const jeepneyIcon = useMemo(() => buildJeepneyIcon(), []);
  const userIcon = useMemo(() => buildUserIcon(), []);
  const pickupIcon = useMemo(() => buildPickupIcon(), []);
  const destinationIcon = useMemo(() => buildDestinationIcon(), []);

  const hasExternalDriverData =
    typeof driverPositionProp?.lat === "number" ||
    typeof driverPositionProp?.lng === "number" ||
    etaMinutesProp != null ||
    trafficProp != null;

  // Sync external driver data
  useEffect(() => {
    if (!hasExternalDriverData) return;

    if (typeof driverPositionProp?.lat === "number" && typeof driverPositionProp?.lng === "number") {
      setDriverLocation({ latitude: driverPositionProp.lat, longitude: driverPositionProp.lng });
      setStatusText("Live driver location");
    }

    if (etaMinutesProp != null) setEtaText(`${etaMinutesProp} min`);
    if (trafficProp != null) setTrafficText(trafficProp);
  }, [driverPositionProp?.lat, driverPositionProp?.lng, etaMinutesProp, trafficProp, hasExternalDriverData]);

  // Fallback polling if no external data
  useEffect(() => {
    if (hasExternalDriverData) return;

    let active = true;
    if (!driverId) {
      setStatusText("Sign in to view live driver updates.");
      return;
    }

    const fetchDriver = async () => {
      try {
        const data = await getDriverLocation(driverId);
        if (!active) return;
        const location = data?.currentLocation ?? data;
        const latitude = location?.latitude ?? location?.lat ?? location?.location?.latitude;
        const longitude = location?.longitude ?? location?.lng ?? location?.location?.longitude;
        
        if (typeof latitude === "number" && typeof longitude === "number") {
          setDriverLocation({ latitude, longitude });
          setStatusText("Live driver location");
        } else {
          setStatusText("Waiting for live driver coordinates...");
        }

        const etaMinutes = location?.etaMinutes ?? data?.etaMinutes;
        setEtaText(location?.eta ?? (etaMinutes != null ? `${etaMinutes} min` : null) ?? null);
        setTrafficText(location?.traffic ?? data?.traffic ?? null);
      } catch (error) {
        if (active) setStatusText("Driver feed unavailable. Retrying...");
      }
    };

    fetchDriver();
    const timer = setInterval(fetchDriver, 2000);
    return () => { active = false; clearInterval(timer); };
  }, [driverId, hasExternalDriverData]);

  // Smooth Marker Animation
  useEffect(() => {
    if (!driverLocation) return;

    const nextLatLng = [driverLocation.latitude, driverLocation.longitude];
    const previousLatLng = previousLocationRef.current;

    if (!markerPositionRef.current) {
      markerPositionRef.current = nextLatLng;
      previousLocationRef.current = nextLatLng;
      setMarkerPosition(nextLatLng);
      return;
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const start = previousLatLng || markerPositionRef.current;
    const end = nextLatLng;
    const duration = 1000;
    const startTime = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const interpolated = [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
      ];

      markerPositionRef.current = interpolated;
      if (markerRef.current) markerRef.current.setLatLng(interpolated);
      
      // Update the state only at the end or occasionally to trigger MapController
      if (progress === 1) {
        setMarkerPosition(interpolated);
      }

      if (progress < 1) animationRef.current = requestAnimationFrame(step);
    };

    previousLocationRef.current = nextLatLng;
    animationRef.current = requestAnimationFrame(step);
    
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [driverLocation]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Mini Stats Overlay */}
      <div className="premium-card" style={{ ...infoCardStyle, margin: 0 }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ETA</p>
          <strong style={{ fontSize: "1.1rem" }}>{etaText || "Calculating..."}</strong>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Traffic</p>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: "999px", background: "rgba(255, 90, 95, 0.1)", color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem" }}>
            {trafficText || "UNKNOWN"}
          </span>
        </div>
      </div>

      <div className="premium-card" style={{ margin: 0, padding: 0, overflow: "hidden", flex: 1 }}>
        <MapContainer 
          center={centerProp ? [centerProp.lat, centerProp.lng] : batangasCityCenter} 
          zoom={zoomProp} 
          style={mapStyle} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={markerPosition} zoom={zoomProp} />

          {/* Route Polyline */}
          {(routePathProp || (DEMO_MODE && showDemoRoute)) && (
            <Polyline
              positions={routePathProp ? routePathProp.map(p => [p.latitude, p.longitude]) : DEMO_PASSENGER.ridingRoute}
              pathOptions={{ color: "#FFD000", weight: 5, opacity: 0.6 }}
            />
          )}

          {/* Markers */}
          {currentPosition && (
            <Marker position={[currentPosition.lat, currentPosition.lng]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {destinationPosition && (
            <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={destinationIcon}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {markerPosition && (
            <Marker ref={markerRef} position={markerPosition} icon={jeepneyIcon}>
              <Popup>{driverLabel}</Popup>
            </Marker>
          )}
          
          {/* Legacy Demo Markers */}
          {DEMO_MODE && showDemoRoute && !routePathProp && (
            <>
              <Polyline positions={DEMO_PASSENGER.walkingRoute} pathOptions={{ color: "#4A90E2", weight: 3, opacity: 0.7, dashArray: "5, 5" }} />
              <Marker position={[DEMO_PASSENGER.pickupPoint.lat, DEMO_PASSENGER.pickupPoint.lng]} icon={pickupIcon} />
            </>
          )}
        </MapContainer>
      </div>

      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>{statusText}</p>
    </div>
  );
}

