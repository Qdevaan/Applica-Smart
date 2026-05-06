import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  value: number | string;
  duration?: number;
  suffix?: string;
  className?: string;
}

const AnimatedNumber = ({ value, duration = 1.2, suffix = "", className }: Props) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toString() + suffix);

  useEffect(() => {
    if (typeof value !== "number") return;
    const controls = animate(motionValue, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  if (typeof value !== "number") {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedNumber;
