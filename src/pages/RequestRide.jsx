import { useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function RequestRide() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = async () => {
    if (!auth.currentUser) { setStatus({ t: "error", msg: "Please log in first." }); return; }
    setLoading(true);
    setStatus({ t: "info", msg: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
          const favs = snap.exists() ? snap.data().favoriteDrivers || [] : [];
          if (favs.length === 0) {
            setStatus({ t: "error", msg: "No favorite drivers yet — swipe right on some drivers first!" });
            setLoading(false); return;
          }
          await addDoc(collection(db, "rideRequests"), {
            riderId: auth.currentUser.uid,
            driverIds: favs,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            status: "pending",
            createdAt: Date.now(),
          });
          setStatus({ t: "success", msg: `✅ Ride requested! ${favs.length} driver${favs.length !== 1 ? "s" : ""} notified.` });
        } catch (e) {
          setStatus({ t: "error", msg: e.message });
        }
        setLoading(false);
      },
      (e) => { setStatus({ t: "error", msg: "Location error: " + e.message }); setLoading(false); }
    );
  };

  return (
    <div className="page center">
      <div className="ride-hero">🚕</div>
      <h2 style={{ fontSize: 30 }}>Ready to go?</h2>
      <p style={{ maxWidth: 280, marginBottom: 8 }}>
        Tap below to notify all your saved drivers that you need a ride right now.
      </p>
      <button onClick={request} disabled={loading} style={{ padding: "16px 48px", fontSize: 17, marginTop: 8 }}>
        {loading ? "Requesting..." : "Request Ride"}
      </button>
      {status && <p className={`msg ${status.t === "error" ? "error" : status.t === "success" ? "success" : ""}`}>{status.msg}</p>}
      {status?.t === "error" && status.msg.includes("favorite") && (
        <Link to="/rider"><button className="ghost" style={{ marginTop: 4 }}>Find Drivers →</button></Link>
      )}
    </div>
  );
}
