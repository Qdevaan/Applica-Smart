import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import ImmersiveBackground from "../components/ui/ImmersiveBackground";
import PageTransition from "../components/ui/PageTransition";

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <ImmersiveBackground intensity="subtle">
          <DashboardNavbar />
          <main className="pt-16">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </main>
        </ImmersiveBackground>
      </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
