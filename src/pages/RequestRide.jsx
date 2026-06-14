import { useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

export default function RequestRide() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestRide = async () => {
    if (!auth.currentUser) {
      setStatus({ type: "error", text: "Please log in first." });
      return;
    }
    setLoading(true);
    setStatus({ type: "info", text: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
          const favoriteDrivers = userSnap.exists() ? userSnap.data().favoriteDrivers || [] : [];

          if (favoriteDrivers.length === 0) {
            setStatus({ type: "error", text: "You have no favorite drivers yet. Go swipe some first!" });
            setLoading(false);
            return;
          }

          await addDoc(collection(db, "rideRequests"), {
            riderId: auth.currentUser.uid,
            driverIds: favoriteDrivers,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            status: "pending",
            createdAt: Date.now(),
          });

          setStatus({ type: "success", text: `Ride requested! Notified ${favoriteDrivers.length} favorite driver(s).` });
        } catch (err) {
          setStatus({ type: "error", text: err.message });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setStatus({ type: "error", text: "Location error: " + err.message });
        setLoading(false);
      }
    );
  };

  return (
    <div className="page page-center">
      <div style={{ fontSize: 64 }}>🚕</div>
      <h2>Ready to ride?</h2>
      <p>We'll send your request to all your favorite drivers nearby</p>
      <button onClick={requestRide} disabled={loading} style={{ padding: "16px 40px", fontSize: 17 }}>
        {loading ? "Requesting..." : "Request Ride"}
      </button>
      {status && (
        <p className={`status-msg ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
