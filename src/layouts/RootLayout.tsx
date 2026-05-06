import { Outlet, useLocation } from "react-router-dom";
import ImmersiveBackground from "../components/ui/ImmersiveBackground";

const RootLayout = () => {
  const location = useLocation();
  // Landing page renders its own immersive hero — skip background here to avoid stacking.
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
      <Outlet />
    </ImmersiveBackground>
  );
};

export default RootLayout;
