import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fileToCompressedDataUrl } from "../utils/image";

export default function DriverSignup() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) {
        setChecking(false);
        return;
      }
      const snap = await getDoc(doc(db, "drivers", auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setName(data.name);
        setPreview(data.photoURL);
      }
      setChecking(false);
    };
    load();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setStatus({ type: "error", text: "Please log in first." });
      return;
    }
    if (!name || (!photo && !profile)) {
      setStatus({ type: "error", text: "Name and photo are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", text: "Getting your location..." });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          let photoURL = profile?.photoURL;
          if (photo) {
            setStatus({ type: "info", text: "Processing photo..." });
            photoURL = await fileToCompressedDataUrl(photo);
          }

          setStatus({ type: "info", text: "Saving profile..." });
          const data = {
            name,
            photoURL,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            updatedAt: Date.now(),
          };
          await setDoc(doc(db, "drivers", auth.currentUser.uid), data);

          setProfile(data);
          setEditing(false);
          setPhoto(null);
          setStatus({ type: "success", text: "Driver profile saved! Riders can now find you." });
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

  if (checking) {
    return (
      <div className="page page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (profile && !editing) {
    return (
      <div className="page">
        <div>
          <h2>Your Driver Profile</h2>
          <p>You're live — riders nearby can see and swipe on your profile</p>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <img
            src={profile.photoURL}
            alt={profile.name}
            style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--secondary)" }}
          />
          <h3>{profile.name}</h3>
          <span className="status-msg success">Online &amp; visible to riders</span>
          <button className="violet" onClick={() => setEditing(true)} style={{ width: "100%" }}>
            Edit Profile
          </button>
        </div>
        {status && (
          <p className={`status-msg ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>
            {status.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div>
        <h2>{profile ? "Edit Your Profile" : "Become a Driver"}</h2>
        <p>Add your name and photo so riders can find and choose you</p>
      </div>
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label>Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Johnson" required />
        </div>
        <div className="field">
          <label>Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} required={!profile} />
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", margin: "0 auto", border: "3px solid var(--secondary)" }}
          />
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="violet" disabled={loading} style={{ flex: 1 }}>
            {loading ? "Saving..." : "Save Driver Profile"}
          </button>
          {profile && (
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {status && (
        <p className={`status-msg ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
