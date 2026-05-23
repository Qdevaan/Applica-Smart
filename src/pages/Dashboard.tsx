import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { jobApplicationService } from "../services/jobApplication.service";
import WelcomeHeroTile from "../components/dashboard/tiles/WelcomeHeroTile";
import AvatarStreakTile from "../components/dashboard/tiles/AvatarStreakTile";
import LastTemplateTile from "../components/dashboard/tiles/LastTemplateTile";
import StatTile from "../components/dashboard/tiles/StatTile";
import RecentJobsTile from "../components/dashboard/tiles/RecentJobsTile";

interface AppStats {
  total: number;
  applied: number;
  pending: number;
  interview: number;
  rejected: number;
  accepted: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    jobApplicationService.getApplicationStats(user.id).then(({ data }) => {
      if (data) setStats(data);
    });
  }, [user?.id]);

  const responseRatePct =
    stats && stats.total > 0
      ? Math.round(((stats.interview + stats.accepted) / stats.total) * 100)
      : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 lg:gap-6">
          <div className="md:col-span-4 lg:col-span-7 lg:row-span-1">
            <WelcomeHeroTile />
          </div>
          <div className="md:col-span-2 lg:col-span-5 lg:row-span-1">
            <AvatarStreakTile />
          </div>

          <div className="md:col-span-6 lg:col-span-7 lg:row-span-2">
            <LastTemplateTile />
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <StatTile
              label="Applications"
              value={stats?.total ?? "—"}
              icon={Briefcase}
              accent="#780000"
              bgAccent="rgba(120,0,0,0.10)"
              delay={0.05}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <StatTile
              label="Response %"
              value={responseRatePct ?? "—"}
              suffix={responseRatePct !== null ? "%" : ""}
              icon={TrendingUp}
              accent="#16a34a"
              bgAccent="rgba(22,163,74,0.10)"
              delay={0.1}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-3">
            <StatTile
              label="Pending"
              value={stats?.pending ?? "—"}
              icon={Clock}
              accent="#669BBC"
              bgAccent="rgba(102,155,188,0.12)"
              delay={0.15}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <StatTile
              label="Interviews"
              value={stats?.interview ?? "—"}
              icon={CheckCircle}
              accent="#C1121F"
              bgAccent="rgba(193,18,31,0.10)"
              delay={0.2}
            />
          </div>

          <div className="md:col-span-6 lg:col-span-5 lg:row-span-1">
            <RecentJobsTile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
