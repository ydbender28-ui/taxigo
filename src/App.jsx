import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DriverSignup from "./pages/DriverSignup";
import SwipeDrivers from "./pages/SwipeDrivers";
import Favorites from "./pages/Favorites";
import RequestRide from "./pages/RequestRide";
import RequireAuth from "./components/RequireAuth";

function RiderLayout() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">🚕 TaxiGo</NavLink>
        <span className="spacer" />
        <NavLink to="/rider" end className={({ isActive }) => (isActive ? "active" : "")}>
          Swipe
        </NavLink>
        <NavLink to="/rider/favorites" className={({ isActive }) => (isActive ? "active" : "")}>
          Favorites
        </NavLink>
        <NavLink to="/rider/request" className={({ isActive }) => (isActive ? "active" : "")}>
          Request Ride
        </NavLink>
        <NavLink to="/rider/login" className={({ isActive }) => (isActive ? "active" : "")}>
          Login
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
}

function DriverLayout() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">🚖 TaxiGo Driver</NavLink>
        <span className="spacer" />
        <NavLink to="/driver" end className={({ isActive }) => (isActive ? "active" : "")}>
          My Profile
        </NavLink>
        <NavLink to="/driver/login" className={({ isActive }) => (isActive ? "active" : "")}>
          Login
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/rider" element={<RiderLayout />}>
          <Route index element={<RequireAuth redirectTo="/rider/login"><SwipeDrivers /></RequireAuth>} />
          <Route path="favorites" element={<RequireAuth redirectTo="/rider/login"><Favorites /></RequireAuth>} />
          <Route path="request" element={<RequireAuth redirectTo="/rider/login"><RequestRide /></RequireAuth>} />
          <Route path="login" element={<Login redirectTo="/rider" />} />
        </Route>

        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<RequireAuth redirectTo="/driver/login"><DriverSignup /></RequireAuth>} />
          <Route path="login" element={<Login redirectTo="/driver" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
