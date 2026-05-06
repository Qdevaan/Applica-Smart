import type { ReactNode } from "react";

interface AuthFormWrapperProps {
  children: ReactNode;
}

const AuthFormWrapper = ({ children }: AuthFormWrapperProps) => {
  return (
    <div
      className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {children}
    </div>
  );
};

export default AuthFormWrapper;
