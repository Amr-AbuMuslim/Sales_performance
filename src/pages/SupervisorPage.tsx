import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { getSupervisorData } from "../services/JsonService";
import { generateYearOptions, MONTH_NAMES } from "../lib/dataHelper";
import { type TeamTargets } from "../types/index";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- COLORS & THEME ---
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"]; // Blue, Purple, Emerald, Amber

export const SupervisorPage: React.FC = () => {
  const [allTeamsData, setAllTeamsData] = useState<TeamTargets[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const years = generateYearOptions();

  // Load Data
  useEffect(() => {
    const load = async () => {
      const data = await getSupervisorData(selectedYear, selectedMonth);
      setAllTeamsData(data);
    };
    load();
  }, [selectedYear, selectedMonth]);

  // --- ADVANCED CALCULATIONS ---
  const analytics = useMemo(() => {
    let grandFlags = 0,
      grandDeals = 0,
      grandNights = 0;
    let targetFlags = 0,
      targetDeals = 0,
      targetNights = 0;
    let totalAgents = 0;

    const teamPerformance = allTeamsData.map((team) => {
      // 1. Calculate Actuals
      const actuals = team.agents.reduce(
        (acc, agent) => {
          const agTotal = agent.dailyRecords.reduce(
            (rAcc, r) => ({
              f: rAcc.f + r.flags,
              d: rAcc.d + r.deals,
              n: rAcc.n + r.nights,
            }),
            { f: 0, d: 0, n: 0 }
          );
          return {
            f: acc.f + agTotal.f,
            d: acc.d + agTotal.d,
            n: acc.n + agTotal.n,
          };
        },
        { f: 0, d: 0, n: 0 }
      );

      // 2. Accumulate Grand Totals
      grandFlags += actuals.f;
      grandDeals += actuals.d;
      grandNights += actuals.n;
      targetFlags += team.targetFlags || 0;
      targetDeals += team.targetDeals || 0;
      targetNights += team.targetNights || 0;
      totalAgents += team.agents.length;

      // 3. Efficiency Score (Average per agent)
      const efficiency =
        team.agents.length > 0
          ? (actuals.d / team.agents.length).toFixed(1)
          : 0;

      return {
        name: team.teamName || team.teamId,
        id: team.teamId,
        agentsCount: team.agents.length,
        actuals,
        targets: {
          f: team.targetFlags,
          d: team.targetDeals,
          n: team.targetNights,
        },
        efficiency,
        progress: {
          f: team.targetFlags ? (actuals.f / team.targetFlags) * 100 : 0,
          d: team.targetDeals ? (actuals.d / team.targetDeals) * 100 : 0,
        },
      };
    });

    // 4. Data for Pie Chart (Contribution)
    const contributionData = teamPerformance.map((t) => ({
      name: t.name,
      value: t.actuals.d, // Based on Deals
    }));

    // 5. Data for Bar Chart
    const comparisonData = teamPerformance.map((t) => ({
      name: t.name,
      Flags: t.actuals.f,
      Deals: t.actuals.d,
      Nights: t.actuals.n,
    }));

    return {
      grand: { f: grandFlags, d: grandDeals, n: grandNights },
      targets: { f: targetFlags, d: targetDeals, n: targetNights },
      totalAgents,
      teamPerformance,
      contributionData,
      comparisonData,
    };
  }, [allTeamsData]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // FULL SCREEN CONTAINER (Covers Sidebar if rendered outside layout, or just looks distinct)
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-3xl font-sans text-gray-800 p-6 md:p-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* --- HEADER --- */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              <BarChart2 className="text-blue-600" size={32} />
              Executive Overview
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Cross-team performance analytics & insights.
            </p>
          </div>

          {/* Glass Filter Bar */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/50">
            <Calendar className="ml-3 text-gray-400" size={20} />
            <div className="h-6 w-px bg-gray-200"></div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* --- HERO KPI CARDS --- */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <KPICard
            title="Total Revenue (Deals)"
            value={analytics.grand.d}
            target={analytics.targets.d}
            icon={<Target className="text-white" size={24} />}
            color="bg-blue-500"
          />
          <KPICard
            title="Total Flags"
            value={analytics.grand.f}
            target={analytics.targets.f}
            icon={<TrendingUp className="text-white" size={24} />}
            color="bg-purple-500"
          />
          <KPICard
            title="Total Nights"
            value={analytics.grand.n}
            target={analytics.targets.n}
            icon={<Award className="text-white" size={24} />}
            color="bg-emerald-500"
          />
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={100} />
            </div>
            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">
              Active Agents
            </h3>
            <p className="text-5xl font-extrabold text-gray-900 mt-2">
              {analytics.totalAgents}
            </p>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 font-medium">
              Across {allTeamsData.length} Teams
            </span>
          </div>
        </motion.div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN COMPARISON CHART */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Team Comparison
              </h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.comparisonData} barGap={8}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="Flags"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="Deals"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="Nights"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* MARKET SHARE PIE */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Deal Contribution
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Which team is driving volume?
            </p>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.contributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.contributionData.map((index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index.value % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* --- DETAILED TEAM CARDS --- */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieIcon size={20} /> Detailed Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.teamPerformance.map((team) => (
              <div
                key={team.id}
                className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-white shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {team.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {team.agentsCount} Active Agents
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                      Efficiency
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {team.efficiency}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        deals/agent
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <ProgressGroup
                    label="Flags"
                    value={team.actuals.f}
                    target={team.targets.f}
                    color="bg-purple-500"
                  />
                  <ProgressGroup
                    label="Deals"
                    value={team.actuals.d}
                    target={team.targets.d}
                    color="bg-emerald-500"
                  />
                  <ProgressGroup
                    label="Nights"
                    value={team.actuals.n}
                    target={team.targets.n}
                    color="bg-blue-500"
                  />
                </div>
              </div>
            ))}
            {analytics.teamPerformance.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white/50 rounded-3xl border border-dashed border-gray-300 text-gray-400">
                No teams data found for this period.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const KPICard = ({ title, value, target, icon, color }: any) => {
  const percentage = target > 0 ? ((value / target) * 100).toFixed(0) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
      {/* Background Decoration */}
      <div
        className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${color}`}
      ></div>

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl shadow-lg ${color}`}>{icon}</div>
        <div className="text-right">
          <span
            className={`text-sm font-bold px-2 py-1 rounded-full bg-gray-100 ${Number(percentage) >= 100 ? "text-green-600" : "text-gray-600"}`}
          >
            {percentage}% Goal
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          <span className="text-xs text-gray-400 font-medium">/ {target}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Number(percentage), 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
};

const ProgressGroup = ({ label, value, target, color }: any) => {
  const percent = target > 0 ? (value / target) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
        <span>{label}</span>
        <span>
          {value} <span className="font-normal text-gray-300">/ {target}</span>
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 1 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
};
