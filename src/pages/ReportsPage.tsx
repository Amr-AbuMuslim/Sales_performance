import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/Card";
import { WeeklyBarChart } from "../components/charts/WeeklyBarChart";
import { ZigzagChart } from "../components/charts/ZigzagChart";
import { MonthlyTrendChart } from "../components/charts/MonthlyTrendChart";
import { getMonthlyData } from "../services/JsonService"; // Updated Service Import
import {
  generateYearOptions,
  MONTH_NAMES,
  getMonthWeekNumber,
} from "../lib/dataHelper";
import { type TeamTargets } from "../types/index";
import { toast } from "sonner";

export const ReportsPage: React.FC = () => {
  const [currentData, setCurrentData] = useState<TeamTargets | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedAgent, setSelectedAgent] = useState("all");

  const years = generateYearOptions();

  // --- FETCH DATA ON FILTER CHANGE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMonthlyData(selectedYear, selectedMonth);
        setCurrentData(data);
      } catch (error) {
        toast.error("Failed to load report data");
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  // --- DATA PROCESSING ---
  // src/pages/ReportsPage.tsx

  // ... inside the component
  const processedData = useMemo(() => {
    if (!currentData) return { weekly: [], daily: [], cumulative: [] };

    // 1. Get all relevant records filtered by Agent
    const relevantRecords = currentData.agents.flatMap((a) => {
      if (selectedAgent !== "all" && a.id !== selectedAgent) return [];
      return a.dailyRecords;
    });

    // 2. Sort records by date
    relevantRecords.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // --- A. WEEKLY DATA ---
    const weeks: Record<
      number,
      { flags: number; deals: number; nights: number }
    > = {
      1: { flags: 0, deals: 0, nights: 0 },
      2: { flags: 0, deals: 0, nights: 0 },
      3: { flags: 0, deals: 0, nights: 0 },
      4: { flags: 0, deals: 0, nights: 0 },
      5: { flags: 0, deals: 0, nights: 0 },
    };

    // --- B. DAILY DATA (Fixed for ZigzagChart) ---
    // Defined generic type to allow flexible key access if needed, or specific type
    const dailyMap: Record<
      string,
      {
        date: string;
        weekday: string;
        flags: number;
        deals: number;
        nights: number;
      }
    > = {};

    relevantRecords.forEach((r) => {
      // 1. Weekly Logic
      const weekNum = getMonthWeekNumber(r.date);
      if (weeks[weekNum]) {
        weeks[weekNum].flags += r.flags;
        weeks[weekNum].deals += r.deals;
        weeks[weekNum].nights += r.nights;
      }

      // 2. Daily Logic
      if (!dailyMap[r.date]) {
        // Create a formatted label for the Chart X-Axis
        const dateObj = new Date(r.date);
        const dayLabel = dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }); // Result: "Dec 8"

        dailyMap[r.date] = {
          date: r.date,
          weekday: dayLabel, // <--- THIS FIXED THE ERROR (Maps "Dec 8" to 'weekday' prop)
          flags: 0,
          deals: 0,
          nights: 0,
        };
      }
      dailyMap[r.date].flags += r.flags;
      dailyMap[r.date].deals += r.deals;
      dailyMap[r.date].nights += r.nights;
    });

    const weekly = Object.entries(weeks)
      .filter(([_, data]) => data.flags + data.deals + data.nights > 0)
      .map(([w, data]) => ({
        week: `Week ${w}`,
        ...data,
      }));

    const daily = Object.values(dailyMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // --- C. CUMULATIVE DATA ---
    let totalFlags = 0;
    let totalDeals = 0;
    let totalNights = 0;

    const cumulative = daily.map((day) => {
      totalFlags += day.flags;
      totalDeals += day.deals;
      totalNights += day.nights;
      return {
        date: day.date,
        flags: totalFlags,
        deals: totalDeals,
        nights: totalNights,
      };
    });

    return { weekly, daily, cumulative };
  }, [currentData, selectedAgent]);
  // Handle Loading / Empty State
  if (!currentData) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed">
        <h2 className="text-xl font-bold text-gray-700">No Data Found</h2>
        <p className="text-gray-500">
          There is no data for {MONTH_NAMES[selectedMonth]} {selectedYear}.
          Please go to the Targets page to initialize this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Report
          </h1>
          <p className="text-gray-500 text-sm">
            Analysis for{" "}
            <span className="font-semibold text-blue-600">
              {currentData.teamName}
            </span>
          </p>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <Card variant="glass">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Year Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Agent View
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Agents (Team View)</option>
              {currentData.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.agentName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* --- CHARTS SECTION --- */}

      {/* 1. Monthly Trend (Cumulative vs Targets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart
          data={processedData.cumulative}
          targets={{
            flags: currentData.targetFlags,
            deals: currentData.targetDeals,
            nights: currentData.targetNights,
          }}
          title="Monthly Accumulation vs Target"
        />

        {/* 2. Weekly Breakdown */}
        <WeeklyBarChart
          data={processedData.weekly}
          title="Weekly Production Breakdown"
        />
      </div>

      {/* 3. Daily Volatility (Zigzag) */}
      <ZigzagChart
        data={processedData.daily}
        title="Daily Performance Volatility"
      />

      {/* --- DETAILED TABLE --- */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Weekly Summary Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Period</th>
                <th className="px-4 py-3 text-right">Flags</th>
                <th className="px-4 py-3 text-right">Deals</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Nights</th>
              </tr>
            </thead>
            <tbody>
              {processedData.weekly.length > 0 ? (
                processedData.weekly.map((w, idx) => (
                  <tr
                    key={w.week}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {w.week}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-blue-600">
                      {w.flags}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-green-600">
                      {w.deals}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-purple-600">
                      {w.nights}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer / Totals */}
            <tfoot className="bg-gray-100 font-bold text-gray-900">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">
                  {processedData.weekly.reduce((acc, c) => acc + c.flags, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {processedData.weekly.reduce((acc, c) => acc + c.deals, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {processedData.weekly.reduce((acc, c) => acc + c.nights, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
