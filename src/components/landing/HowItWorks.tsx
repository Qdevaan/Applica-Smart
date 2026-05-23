import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HOW_IT_WORKS_STEPS } from "../../utils/constants";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "../../utils/animationVariants";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section
      id="how-it-works"
      className="py-20"
      style={{
        background:
          "linear-gradient(to bottom, var(--color-surface), var(--color-background))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-primary)",
            }}
          >
            Simple Process
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--color-text-main)" }}
          >
            How It Works
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: "var(--color-text-body)" }}
          >
            Get started in minutes and let our AI do the heavy lifting
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              variants={scaleIn}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="relative"
            >
              <div
                className="rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border h-full"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-accent)",
                }}
              >
                {/* Step Number */}
                <motion.div
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#780000] to-[#C1121F] rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.id}
                </motion.div>

                {/* Step Badge */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-[#780000]/10 text-[#780000] rounded-full text-xs font-semibold">
                    {step.step}
                  </span>
                </div>

                {/* Icon/Illustration */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#780000]/10 to-[#C1121F]/10 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-[#780000]" />
                  </div>
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-lg  leading-relaxed"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {step.description}
                </p>

                {/* Connector Line (hidden on last item and on mobile) */}
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#780000]/30 to-[#C1121F]/30" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(120, 0, 0, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-gradient-to-r from-[#780000] to-[#C1121F] text-white rounded-full font-semibold text-lg shadow-lg"
          >
            Get Started Free
          </motion.button>
          <p className="mt-4" style={{ color: "var(--color-text-body)" }}>
            No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
