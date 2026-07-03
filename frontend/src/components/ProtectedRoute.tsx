import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "./PageLoader";
import api from "../services/api";
import { clearAuthSession, getValidAuthToken } from "../services/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    let cancelled = false;
    const token = getValidAuthToken();

    if (!token) {
      queueMicrotask(() => {
        if (!cancelled) setAuthState("unauthenticated");
      });
      return;
    }

    queueMicrotask(() => {
      if (!cancelled) setAuthState("checking");
    });

    api.get("/users/me")
      .then(() => {
        if (!cancelled) setAuthState("authenticated");
      })
      .catch(() => {
        clearAuthSession();
        if (!cancelled) setAuthState("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (authState === "checking") {
    return <PageLoader text="Duke verifikuar sesionin…" />;
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
