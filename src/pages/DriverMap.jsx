import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Fix leaflet default icons broken in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const meIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#ff6b35;border:3px solid #fff;box-shadow:0 0 0 5px rgba(255,107,53,0.25)"></div>`,
  className: "", iconSize: [20, 20], iconAnchor: [10, 10],
});

const driverIcon = (name) => L.divIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
    <div style="width:42px;height:42px;border-radius:50%;background:#7c3aed;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 16px rgba(0,0,0,0.4)">🚖</div>
    <div style="background:rgba(10,10,15,0.85);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;backdrop-filter:blur(8px)">${name}</div>
  </div>`,
  className: "", iconSize: [42, 60], iconAnchor: [21, 60],
});

export default function DriverMap() {
  const [pos, setPos] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        try {
          const snap = await getDocs(collection(db, "drivers"));
          setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { setError(e.message); }
        setLoading(false);
      },
      (e) => { setError("Location error: " + e.message); setLoading(false); }
    );
  }, []);

  if (loading) return (
    <div className="page center">
      <div className="spinner" />
      <p style={{ marginTop: 12 }}>Finding your location...</p>
    </div>
  );

  if (error) return (
    <div className="page center">
      <p className="msg error">{error}</p>
    </div>
  );

  return (
    <div className="page wide" style={{ padding: "24px 20px 60px" }}>
      <div>
        <h2 style={{ fontSize: 26 }}>Live Driver Map</h2>
        <p style={{ marginTop: 4 }}>{drivers.length} driver{drivers.length !== 1 ? "s" : ""} available near you</p>
      </div>
      <div className="map-wrap" style={{ height: 480 }}>
        <MapContainer center={pos} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={pos} icon={meIcon}>
            <Popup><strong>You</strong></Popup>
          </Marker>
          <Circle center={pos} radius={2000} pathOptions={{ color: "#ff6b35", fillColor: "#ff6b35", fillOpacity: 0.06, weight: 1 }} />
          {drivers.map(d => (
            <Marker key={d.id} position={[d.lat, d.lng]} icon={driverIcon(d.name)}>
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <img src={d.photoURL} alt={d.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                  <p style={{ marginTop: 6, fontWeight: 700 }}>{d.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {drivers.map(d => (
          <div key={d.id} className="driver-row" style={{ flex: "1 1 200px" }}>
            <img src={d.photoURL} alt={d.name} />
            <div>
              <div className="name">{d.name}</div>
              <div className="dist">Available</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
