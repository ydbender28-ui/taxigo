import { useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { fileToCompressedDataUrl } from "../utils/image";

export default function DriverSignup() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!name || !photo) {
      setStatus({ type: "error", text: "Name and photo are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", text: "Getting your location..." });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setStatus({ type: "info", text: "Processing photo..." });
          const photoURL = await fileToCompressedDataUrl(photo);

          setStatus({ type: "info", text: "Saving profile..." });
          await setDoc(doc(db, "drivers", auth.currentUser.uid), {
            name,
            photoURL,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            updatedAt: Date.now(),
          });

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

  return (
    <div className="page">
      <div>
        <h2>Become a Driver</h2>
        <p>Add your name and photo so riders can find and choose you</p>
      </div>
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label>Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Johnson" required />
        </div>
        <div className="field">
          <label>Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} required />
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", margin: "0 auto" }}
          />
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Driver Profile"}
        </button>
      </form>
      {status && (
        <p className={`status-msg ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
