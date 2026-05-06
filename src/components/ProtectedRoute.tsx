import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Debug: Log EVERYTHING
  console.log("🛡️ ProtectedRoute RENDER:", {
    hasUser: !!user,
    userEmail: user?.email || "none",
    userId: user?.id || "none",
    loading,
    timeoutReached,
    path: location.pathname,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    console.log("🛡️ ProtectedRoute useEffect triggered:", {
      hasUser: !!user,
      userEmail: user?.email || "none",
      loading,
      timeoutReached,
      path: location.pathname,
    });
  }, [user, loading, timeoutReached, location.pathname]);

  // Safety timeout in case loading gets stuck
  useEffect(() => {
    // Reset timeout if user is found
    if (user) {
      setTimeoutReached(false);
      return;
    }

    const timer = setTimeout(() => {
      if (loading && !user) {
        console.error(
          "⏰ Auth loading timeout reached - forcing redirect to login"
        );
        setTimeoutReached(true);
      }
    }, 5000); // Increased to 5 seconds

    return () => clearTimeout(timer);
  }, [loading, user]);

  if (loading && !timeoutReached) {
    console.log("⏳ Still loading auth, showing spinner...");
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p className="font-medium" style={{ color: "var(--color-text-main)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user || timeoutReached) {
    console.log("🚫 No user or timeout - redirecting to login", {
      hasUser: !!user,
      timeoutReached,
    });
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
