import { motion } from "framer-motion";
import { FEATURES } from "../../utils/constants";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "../../utils/animationVariants";

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="py-20"
      style={{ backgroundColor: "var(--color-surface)" }}
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
            Features
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--color-text-main)" }}
          >
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
              Succeed
            </span>
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: "var(--color-text-body)" }}
          >
            Powerful features designed to streamline your job search and
            maximize your chances of landing interviews
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={scaleIn}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="group"
            >
              <div
                className="rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all border h-full relative overflow-hidden"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-accent)",
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#780000]/5 to-[#C1121F]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-[#780000]/10 to-[#C1121F]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon
                      className="w-8 h-8"
                      style={{ color: "var(--color-primary)" }}
                    />
                  </motion.div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold mb-3 transition-colors"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <motion.div
                    className="mt-4 flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-primary)" }}
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <span>Learn more</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-[#780000]/20 to-[#C1121F]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-20 bg-gradient-to-r from-[#780000] to-[#C1121F] rounded-3xl p-12 text-white"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <motion.h3
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                10K+
              </motion.h3>
              <p className="text-[#FDF0D5]/90">Active Users</p>
            </div>
            <div>
              <motion.h3
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                500K+
              </motion.h3>
              <p className="text-[#FDF0D5]/90">Applications Sent</p>
            </div>
            <div>
              <motion.h3
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              >
                85%
              </motion.h3>
              <p className="text-[#FDF0D5]/90">Success Rate</p>
            </div>
            <div>
              <motion.h3
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                50+
              </motion.h3>
              <p className="text-[#FDF0D5]/90">Job Platforms</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
