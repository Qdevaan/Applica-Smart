import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ui/ErrorBoundary";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
          <DashboardNavbar />
          <main className="pt-16">
            <Outlet />
          </main>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
