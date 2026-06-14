import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const riderIcon = new L.DivIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#ff6b35;border:3px solid #fff;box-shadow:0 0 0 4px rgba(255,107,53,0.3)"></div>`,
  className: "",
  iconSize: [18, 18],
});

const driverIcon = new L.DivIcon({
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#6c5ce7;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.4)">🚖</div>`,
  className: "",
  iconSize: [36, 36],
});

export default function DriverMap() {
  const [pos, setPos] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          setPos([p.coords.latitude, p.coords.longitude]);
          const snap = await getDocs(collection(db, "drivers"));
          setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location error: " + err.message);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="page page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page-center">
        <p className="status-msg error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page page-wide">
      <div>
        <h2>Drivers Near You</h2>
        <p>Live map of available drivers in your area</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden", height: 480 }}>
        <MapContainer center={pos} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={pos} icon={riderIcon}>
            <Popup>You are here</Popup>
          </Marker>
          {drivers.map((d) => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={driverIcon}>
              <Popup>{d.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
