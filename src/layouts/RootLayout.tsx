import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ImmersiveBackground from "../components/ui/ImmersiveBackground";
import PageTransition from "../components/ui/PageTransition";

const RootLayout = () => {
  const location = useLocation();
  // Landing page renders its own immersive hero — skip wrapper to avoid stacking.
  const skipBackground = location.pathname === "/";

  if (skipBackground) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <Outlet />
      </div>
    );
  }

  return (
    <ImmersiveBackground intensity="normal">
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </ImmersiveBackground>
  );
};

export default RootLayout;
