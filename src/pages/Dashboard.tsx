import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { jobApplicationService } from "../services/jobApplication.service";

interface AppStats {
  total: number;
  applied: number;
  pending: number;
  interview: number;
  rejected: number;
  accepted: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    jobApplicationService.getApplicationStats(user.id).then(({ data }) => {
      if (data) setStats(data);
    });
  }, [user?.id]);

  const responseRate =
    stats && stats.total > 0
      ? `${Math.round(((stats.interview + stats.accepted) / stats.total) * 100)}%`
      : "—";

  const statCards = [
    {
      label: "Applications Sent",
      value: stats?.total ?? "—",
      icon: Briefcase,
      color: "text-[#780000]",
      bgColor: "bg-[#780000]/10",
    },
    {
      label: "Response Rate",
      value: responseRate,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Pending",
      value: stats?.pending ?? "—",
      icon: Clock,
      color: "text-[#669BBC]",
      bgColor: "bg-[#669BBC]/10",
    },
    {
      label: "Interviews",
      value: stats?.interview ?? "—",
      icon: CheckCircle,
      color: "text-[#C1121F]",
      bgColor: "bg-[#C1121F]/10",
    },
  ];

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
            style={{ color: "var(--color-text-main)" }}
          >
            Welcome back, {profile?.name || user?.email?.split("@")[0]}!
          </h1>
          <p
            className="text-base sm:text-lg mb-6 sm:mb-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            Here's what's happening with your job applications today.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl p-4 sm:p-6 shadow-sm border hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-accent-light)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              style={{ color: "var(--color-text-main)" }}
            >
              Recent Applications
            </h2>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--color-text-muted)" }}
            >
              {stats?.total === 0
                ? "No applications yet. Go to the Jobs page to find matching positions."
                : "Your recent job applications will appear here."}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
