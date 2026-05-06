import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import ImmersiveBackground from "../components/ui/ImmersiveBackground";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <ImmersiveBackground intensity="subtle">
          <DashboardNavbar />
          <main className="pt-16">
            <Outlet />
          </main>
        </ImmersiveBackground>
      </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
