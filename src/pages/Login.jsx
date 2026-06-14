import { useState } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login({ redirectTo = "/" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const friendlyError = (err) => {
    switch (err.code) {
      case "auth/missing-password":
      case "auth/missing-email":
        return "Please enter both an email and password.";
      case "auth/invalid-email":
        return "That email address looks invalid.";
      case "auth/email-already-in-use":
        return "An account with that email already exists. Try logging in instead.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      default:
        return err.message;
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both an email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirectTo);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both an email and password.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate(redirectTo);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <div className="page page-center">
      <h2>Welcome to TaxiGo</h2>
      <p>Log in or create an account to get started</p>
      <div className="card" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleLogin} style={{ flex: 1 }}>Log In</button>
          <button onClick={handleSignup} className="secondary" style={{ flex: 1 }}>Sign Up</button>
        </div>
        {error && <p className="status-msg error">{error}</p>}
      </div>
    </div>
  );
}
