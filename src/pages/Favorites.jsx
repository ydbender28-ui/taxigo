import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!auth.currentUser) {
      setError("Please log in to view your favorites.");
      setLoading(false);
      return;
    }
    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const ids = userSnap.exists() ? userSnap.data().favoriteDrivers || [] : [];

      const drivers = [];
      for (const id of ids) {
        const dSnap = await getDoc(doc(db, "drivers", id));
        if (dSnap.exists()) drivers.push({ id, ...dSnap.data() });
      }
      setFavorites(drivers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (driverId) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      favoriteDrivers: arrayRemove(driverId),
    });
    setFavorites((prev) => prev.filter((d) => d.id !== driverId));
  };

  if (loading) {
    return (
      <div className="page page-center">
        <div className="spinner" />
        <p>Loading favorites...</p>
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
        <h2>Your Favorite Drivers</h2>
        <p>These drivers get notified when you request a ride</p>
      </div>
      {favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>Go swipe right on some drivers to add them here!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {favorites.map((driver) => (
            <div key={driver.id} className="driver-row">
              <img src={driver.photoURL} alt={driver.name} />
              <div className="info">
                <div className="name">{driver.name}</div>
              </div>
              <button className="danger" onClick={() => remove(driver.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
