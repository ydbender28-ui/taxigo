import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DriverSignup from "./pages/DriverSignup";
import SwipeDrivers from "./pages/SwipeDrivers";
import Favorites from "./pages/Favorites";
import RequestRide from "./pages/RequestRide";
import DriverRequests from "./pages/DriverRequests";
import DriverMap from "./pages/DriverMap";
import RequireAuth from "./components/RequireAuth";

function RiderLayout() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">🚕 TaxiGo</NavLink>
        <span className="spacer" />
        <NavLink to="/rider/map" className={({ isActive }) => isActive ? "active" : ""}>Map</NavLink>
        <NavLink to="/rider/swipe" className={({ isActive }) => isActive ? "active" : ""}>Swipe</NavLink>
        <NavLink to="/rider/favorites" className={({ isActive }) => isActive ? "active" : ""}>Favorites</NavLink>
        <NavLink to="/rider/request" className={({ isActive }) => isActive ? "active" : ""}>Request Ride</NavLink>
        <NavLink to="/rider/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink>
      </nav>
      <Outlet />
    </>
  );
}

function DriverLayout() {
  return (
    <div className="driver-theme">
      <nav className="navbar">
        <NavLink to="/" className="brand">🚖 Driver</NavLink>
        <span className="spacer" />
        <NavLink to="/driver" end className={({ isActive }) => isActive ? "active" : ""}>My Profile</NavLink>
        <NavLink to="/driver/requests" className={({ isActive }) => isActive ? "active" : ""}>Ride Requests</NavLink>
        <NavLink to="/driver/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

const guard = (el, to) => <RequireAuth redirectTo={to}>{el}</RequireAuth>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/rider" element={<RiderLayout />}>
          <Route index element={guard(<DriverMap />, "/rider/login")} />
          <Route path="map" element={guard(<DriverMap />, "/rider/login")} />
          <Route path="swipe" element={guard(<SwipeDrivers />, "/rider/login")} />
          <Route path="favorites" element={guard(<Favorites />, "/rider/login")} />
          <Route path="request" element={guard(<RequestRide />, "/rider/login")} />
          <Route path="login" element={<Login redirectTo="/rider/map" />} />
        </Route>

        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={guard(<DriverSignup />, "/driver/login")} />
          <Route path="requests" element={guard(<DriverRequests />, "/driver/login")} />
          <Route path="login" element={<Login redirectTo="/driver" isDriver />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
