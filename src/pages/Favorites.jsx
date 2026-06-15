import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc, arrayRemove } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!auth.currentUser) { setLoading(false); return; }
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const ids = snap.exists() ? snap.data().favoriteDrivers || [] : [];
      const list = [];
      for (const id of ids) {
        const d = await getDoc(doc(db, "drivers", id));
        if (d.exists()) list.push({ id, ...d.data() });
      }
      setFavorites(list);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (driverId) => {
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      { favoriteDrivers: arrayRemove(driverId) },
      { merge: true }
    );
    setFavorites(prev => prev.filter(d => d.id !== driverId));
  };

  if (loading) return <div className="page center"><div className="spinner" /></div>;
  if (error) return <div className="page center"><p className="msg error">{error}</p></div>;

  return (
    <div className="page">
      <div>
        <h2 style={{ fontSize: 26 }}>Your Drivers</h2>
        <p>These drivers get notified when you request a ride</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">💛</div>
          <h3>No favorites yet</h3>
          <p>Swipe right on a driver to save them here</p>
          <Link to="/rider"><button style={{ marginTop: 16 }}>Find Drivers</button></Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {favorites.map(d => (
            <div key={d.id} className="driver-row">
              <img src={d.photoURL} alt={d.name} />
              <div style={{ flex: 1 }}>
                <div className="name">{d.name}</div>
                <div className="dist">Saved driver</div>
              </div>
              <button className="danger" onClick={() => remove(d.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
