import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import { db, auth } from "../firebase/config";
import { collection, getDocs, doc, setDoc, arrayUnion } from "firebase/firestore";
import { getDistanceKm } from "../utils/distance";

export default function SwipeDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const snap = await getDocs(collection(db, "drivers"));
          const list = snap.docs.map(d => ({
            id: d.id, ...d.data(),
            distance: getDistanceKm(pos.coords.latitude, pos.coords.longitude, d.data().lat, d.data().lng),
          }));
          list.sort((a, b) => a.distance - b.distance);
          setDrivers(list);
        } catch (e) { setError(e.message); }
        setLoading(false);
      },
      (e) => { setError("Location error: " + e.message); setLoading(false); }
    );
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const onSwipe = async (dir, driver) => {
    setDrivers(prev => prev.filter(d => d.id !== driver.id));
    if (dir === "right" && auth.currentUser) {
      try {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { favoriteDrivers: arrayUnion(driver.id) },
          { merge: true }
        );
        showToast(`❤️ ${driver.name} saved!`);
      } catch (e) { showToast("⚠️ " + e.message); }
    } else if (dir === "left") {
      showToast(`👋 Skipped ${driver.name}`);
    }
  };

  if (loading) return (
    <div className="page center">
      <div className="spinner" />
      <p style={{ marginTop: 12 }}>Finding drivers near you...</p>
    </div>
  );

  if (error) return (
    <div className="page center"><p className="msg error">{error}</p></div>
  );

  if (drivers.length === 0) return (
    <div className="page center">
      <div className="empty">
        <div className="empty-icon">🚖</div>
        <h3>No more drivers</h3>
        <p>You've seen everyone nearby. Check back soon!</p>
      </div>
    </div>
  );

  const top = drivers[drivers.length - 1];

  return (
    <div className="swipe-page">
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 26 }}>Find Your Driver</h2>
        <p className="swipe-counter">{drivers.length} driver{drivers.length !== 1 ? "s" : ""} nearby</p>
      </div>

      <div className="swipe-stack">
        {drivers.map(driver => (
          <TinderCard key={driver.id} onSwipe={dir => onSwipe(dir, driver)} preventSwipe={["up", "down"]}>
            <div className="swipe-card-wrap">
              <img src={driver.photoURL} alt={driver.name} />
              <div className="swipe-card-info">
                <h3>{driver.name}</h3>
                <span className="dist-chip">📍 {driver.distance.toFixed(1)} km away</span>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      <div className="swipe-btns">
        <button className="swipe-btn skip ghost" onClick={() => onSwipe("left", top)}>✕</button>
        <button className="swipe-btn like" onClick={() => onSwipe("right", top)}>♥</button>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 999, padding: "12px 24px", fontSize: 15, fontWeight: 700,
          backdropFilter: "blur(12px)", color: "#fff", zIndex: 999, whiteSpace: "nowrap",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)"
        }}>{toast}</div>
      )}
    </div>
  );
}
