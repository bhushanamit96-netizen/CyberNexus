import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapZoomAnimation() {
  const map = useMap();

  useEffect(() => {
    // Demo coordinates only — not a real scammer location
    const demoLocation = [17.385, 78.4867];


    map.setView([20, 0], 2);

    const indiaTimer = setTimeout(() => {
      map.flyTo([22.5, 79], 4, { duration: 2 });
    }, 800);

    const cityTimer = setTimeout(() => {
      map.flyTo(demoLocation, 11, { duration: 3 });
    }, 3500);

    return () => {
      clearTimeout(indiaTimer);
      clearTimeout(cityTimer);
    };
  }, [map]);

  return null;
}

function LocationMap({ onBack }) {
  const demoLocation = [17.385, 78.4867];

   // Simulated cyber activity for the demo — not real attack data
const attackPoints = [
  [37.7749, -122.4194],
  [40.7128, -74.006],
  [51.5072, -0.1276],
  [48.8566, 2.3522],
  [28.6139, 77.209],
  [19.076, 72.8777],
  [17.385, 78.4867],
  [35.6762, 139.6503],
  [-33.8688, 151.2093],
];

const attackConnections = [
  [attackPoints[0], attackPoints[6]],
  [attackPoints[1], attackPoints[4]],
  [attackPoints[2], attackPoints[7]],
  [attackPoints[3], attackPoints[5]],
  [attackPoints[4], attackPoints[8]],
];


  return (
    <div className="location-map-view">
       
      <div className="location-map-header">
        <div>
          <strong>LOCATION VIEW</strong>
          <small>Demo location · Not verified</small>
        </div>

        <button onClick={onBack} className="location-map-back">
          ← Back to Graph
        </button>
      </div>

      <MapContainer
  center={[20, 0]}
  zoom={2}
  scrollWheelZoom={true}
  style={{ height: "560px", width: "100%", background: "#ffffff" }}
  className="location-map"
>
      <TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

        <MapZoomAnimation />

{/* Simulated attack connections */}
{attackConnections.map((connection, index) => (
  <Polyline
    key={`connection-${index}`}
    positions={connection}
    pathOptions={{
        className: "cyber-attack-pulse",
        className: "cyber-attack-line",
      color: ["#00d9ff", "#8b5cf6", "#00ff9c", "#ff3b81", "#facc15"][index],
      weight: 1.5,
      opacity: 0.8,
      dashArray: "6 8",
    }}
  />
))}

{/* Simulated attack points */}
{attackPoints.map((point, index) => (
  <CircleMarker
    key={`attack-point-${index}`}
    center={point}
    radius={7}
    pathOptions={{
      color: "#00d9ff",
      weight: 2,
      opacity: 1,
      fillColor: "#008cff",
      fillOpacity: 0.25,
    }}
  />
))}

<Marker position={demoLocation}>
          <Popup>
            <strong>Hyderabad, India</strong>
            <br />
            Demo location only — not a verified source location.
          </Popup>
        </Marker>
        <div className="cyber-map-legend">
  <span><i className="legend-dot cyan" /> Simulated Activity</span>
  <span><i className="legend-line" /> Simulated Connection</span>
  <span><i className="legend-dot blue" /> Demo Location</span>
</div>
      </MapContainer>
    </div>
  );
}

export default LocationMap;