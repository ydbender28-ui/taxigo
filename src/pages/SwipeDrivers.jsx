import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import { db, auth } from "../firebase/config";
import { collection, getDocs, doc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDistanceKm } from "../utils/distance";

export default function SwipeDrivers() {
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
      async (pos) => {
        try {
          const myLat = pos.coords.latitude;
          const myLng = pos.coords.longitude;

          const snap = await getDocs(collection(db, "drivers"));
          const list = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              distance: getDistanceKm(myLat, myLng, data.lat, data.lng),
            };
          });
          list.sort((a, b) => a.distance - b.distance);
          setDrivers(list);
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

  const handleSwipe = async (direction, driverId) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      if (direction === "right") {
        await updateDoc(userRef, { favoriteDrivers: arrayUnion(driverId) }).catch(async () => {
          await setDoc(userRef, { favoriteDrivers: [driverId] }, { merge: true });
        });
      } else {
        await updateDoc(userRef, { favoriteDrivers: arrayRemove(driverId) }).catch(() => {});
      }
    } catch {
      // ignore — non-critical
    }
  };

  const removeTop = (id, direction) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    handleSwipe(direction, id);
  };

  if (loading) {
    return (
      <div className="page page-center">
        <div className="spinner" />
        <p>Finding nearby drivers...</p>
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

  if (drivers.length === 0) {
    return (
      <div className="page page-center">
        <div className="empty-state">
          <h2>No drivers nearby</h2>
          <p>Check back later, or be the first driver in your area!</p>
        </div>
      </div>
    );
  }

  const top = drivers[drivers.length - 1];

  return (
    <div className="page">
      <div>
        <h2>Find Your Driver</h2>
        <p>Swipe right to save as favorite, left to skip</p>
      </div>
      <div className="swipe-stack">
        {drivers.map((driver) => (
          <TinderCard
            key={driver.id}
            onSwipe={(dir) => removeTop(driver.id, dir)}
            preventSwipe={["up", "down"]}
            className="swipe-card"
          >
            <img src={driver.photoURL} alt={driver.name} />
            <div className="swipe-info">
              <h3>{driver.name}</h3>
              <span className="distance-badge">{driver.distance.toFixed(1)} km away</span>
            </div>
          </TinderCard>
        ))}
      </div>
      <div className="swipe-actions">
        <button className="secondary" onClick={() => removeTop(top.id, "left")} aria-label="Skip">
          ✕
        </button>
        <button onClick={() => removeTop(top.id, "right")} aria-label="Save">
          ♥
        </button>
      </div>
    </div>
  );
}
