import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-emoji">🚕</div>
      <h1>TaxiGo</h1>
      <p className="sub">
        Pick the drivers you trust. Request a ride and only they get notified — no strangers.
      </p>
      <div className="portal-grid">
        <Link to="/rider" className="portal-card rider">
          <div className="icon">🙋</div>
          <h2>I'm a Rider</h2>
          <p>Find and save your favorite drivers</p>
        </Link>
        <Link to="/driver" className="portal-card driver">
          <div className="icon">🚖</div>
          <h2>I'm a Driver</h2>
          <p>Create a profile and get ride requests</p>
        </Link>
      </div>
    </div>
  );
}
