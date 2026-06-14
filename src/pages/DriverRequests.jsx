import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDistanceKm } from "../utils/distance";

export default function DriverRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverPos, setDriverPos] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // get driver's own saved location for distance calc
    getDoc(doc(db, "drivers", auth.currentUser.uid)).then((snap) => {
      if (snap.exists()) setDriverPos(snap.data());
    });

    const q = query(
      collection(db, "rideRequests"),
      where("driverIds", "array-contains", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const items = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();
            let riderName = "A rider";
            try {
              const riderSnap = await getDoc(doc(db, "users", data.riderId));
              if (riderSnap.exists() && riderSnap.data().displayName) {
                riderName = riderSnap.data().displayName;
              }
            } catch {
              // ignore - default name used
            }
            return { id: d.id, ...data, riderName };
          })
        );
        items.sort((a, b) => b.createdAt - a.createdAt);
        setRequests(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const respond = async (id, status) => {
    await updateDoc(doc(db, "rideRequests", id), { status });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

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
    <div className="page">
      <div>
        <h2>Ride Requests</h2>
        <p>Riders who saved you and are requesting a ride</p>
      </div>
      {requests.length === 0 ? (
        <div className="empty-state">
          <h2>No requests right now</h2>
          <p>You'll see them here as soon as a rider requests you.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((r) => {
            const dist = driverPos ? getDistanceKm(driverPos.lat, driverPos.lng, r.lat, r.lng) : null;
            return (
              <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>{r.riderName}</h3>
                    {dist !== null && <p>{dist.toFixed(1)} km away</p>}
                  </div>
                  <span className="status-msg" style={{ padding: "6px 12px" }}>
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => respond(r.id, "accepted")} style={{ flex: 1 }}>
                    Accept
                  </button>
                  <button className="danger" onClick={() => respond(r.id, "declined")} style={{ flex: 1 }}>
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
