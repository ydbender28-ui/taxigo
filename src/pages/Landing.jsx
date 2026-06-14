import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <div className="logo">🚕</div>
      <h1>TaxiGo</h1>
      <p className="tagline">
        Swipe to find drivers you trust. Request a ride and notify only the people you choose.
      </p>
      <div className="portal-grid">
        <Link to="/rider" className="portal-card rider">
          <div className="icon">🙋</div>
          <h2>I'm a Rider</h2>
          <p>Browse nearby drivers, save favorites, and request rides</p>
        </Link>
        <Link to="/driver" className="portal-card driver">
          <div className="icon">🚖</div>
          <h2>I'm a Driver</h2>
          <p>Set up your profile so riders nearby can find and pick you</p>
        </Link>
      </div>
    </div>
  );
}
