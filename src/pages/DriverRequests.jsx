import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDistanceKm } from "../utils/distance";

export default function DriverRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverPos, setDriverPos] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return; }
    getDoc(doc(db, "drivers", auth.currentUser.uid)).then(s => { if (s.exists()) setDriverPos(s.data()); });

    const q = query(
      collection(db, "rideRequests"),
      where("driverIds", "array-contains", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    return onSnapshot(q, async (snap) => {
      const items = await Promise.all(snap.docs.map(async d => {
        const data = d.data();
        let riderEmail = "A rider";
        try {
          const r = await getDoc(doc(db, "users", data.riderId));
          if (r.exists() && r.data().email) riderEmail = r.data().email;
        } catch { /* ignore */ }
        return { id: d.id, ...data, riderEmail };
      }));
      setRequests(items.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
  }, []);

  const respond = async (id, status) => {
    await updateDoc(doc(db, "rideRequests", id), { status });
  };

  if (loading) return <div className="page center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div>
        <h2 style={{ fontSize: 26 }}>Ride Requests</h2>
        <p>Live — updates automatically</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📱</div>
          <h3>No requests yet</h3>
          <p>When a rider requests you, it'll appear here instantly.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map(r => {
            const dist = driverPos ? getDistanceKm(driverPos.lat, driverPos.lng, r.lat, r.lng) : null;
            return (
              <div key={r.id} className="req-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 17 }}>🙋 {r.riderEmail}</h3>
                    {dist !== null && <p style={{ marginTop: 4, fontSize: 13 }}>📍 {dist.toFixed(1)} km from you</p>}
                  </div>
                  <span className="req-time">{new Date(r.createdAt).toLocaleTimeString()}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => respond(r.id, "accepted")} style={{ flex: 1 }}>✓ Accept</button>
                  <button className="danger" onClick={() => respond(r.id, "declined")} style={{ flex: 1 }}>✕ Decline</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
