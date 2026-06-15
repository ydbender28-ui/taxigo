import { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login({ redirectTo = "/", isDriver = false }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const friendly = (err) => {
    switch (err.code) {
      case "auth/missing-password":
      case "auth/missing-email": return "Please enter both email and password.";
      case "auth/invalid-email": return "That email looks invalid.";
      case "auth/email-already-in-use": return "Account already exists — try logging in.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found": return "Wrong email or password.";
      default: return err.message;
    }
  };

  const handle = async () => {
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true); setError("");
    try {
      if (tab === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      navigate(redirectTo);
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  const accent = isDriver ? "violet" : "orange";

  return (
    <div className="login-wrap">
      <div className="logo-small">{isDriver ? "🚖" : "🚕"}</div>
      <h2>{isDriver ? "Driver Portal" : "Rider Portal"}</h2>
      <div className="login-box">
        <div className="tab-row">
          <button className={`tab-btn ${tab === "login" ? `active ${accent}` : ""}`} onClick={() => setTab("login")}>
            Log In
          </button>
          <button className={`tab-btn ${tab === "signup" ? `active ${accent}` : ""}`} onClick={() => setTab("signup")}>
            Sign Up
          </button>
        </div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && handle()} /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} /></div>
        <button className={isDriver ? "violet" : ""} onClick={handle} disabled={loading} style={{ width: "100%", padding: "14px" }}>
          {loading ? "Please wait..." : tab === "login" ? "Log In" : "Create Account"}
        </button>
        {error && <p className="msg error">{error}</p>}
      </div>
    </div>
  );
}
