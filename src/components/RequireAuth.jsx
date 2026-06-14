import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function RequireAuth({ children, redirectTo }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (user === undefined) {
    return (
      <div className="page page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user === null) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
