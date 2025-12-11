import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../components/ui/Card";
import { WeeklyBarChart } from "../components/charts/WeeklyBarChart";
import { ZigzagChart } from "../components/charts/ZigzagChart";
import { MonthlyTrendChart } from "../components/charts/MonthlyTrendChart";
import { getMonthlyData } from "../services/JsonService";
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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMonthlyData(selectedYear, selectedMonth);
        setCurrentData(data); // Can be null, that's fine
      } catch (error) {
        console.error(error);
        toast.error("Failed to load report data");
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  // --- DATA PROCESSING (Safe  checks for null) ---
  const processedData = useMemo(() => {
    if (!currentData) return { weekly: [], daily: [], cumulative: [] };

    const relevantRecords = currentData.agents.flatMap((a) => {
      if (selectedAgent !== "all" && a.id !== selectedAgent) return [];
      return a.dailyRecords;
    });

    relevantRecords.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Weekly Logic
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

    // Daily Logic
    const dailyMap: Record<string, any> = {};

    relevantRecords.forEach((r) => {
      const weekNum = getMonthWeekNumber(r.date);
      if (weeks[weekNum]) {
        weeks[weekNum].flags += r.flags;
        weeks[weekNum].deals += r.deals;
        weeks[weekNum].nights += r.nights;
      }

      if (!dailyMap[r.date]) {
        dailyMap[r.date] = {
          date: r.date,
          weekday: new Date(r.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }),
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
      .filter(([_, d]) => d.flags + d.deals + d.nights > 0)
      .map(([w, d]) => ({ week: `Week ${w}`, ...d }));

    const daily = Object.values(dailyMap).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Cumulative
    let tf = 0,
      td = 0,
      tn = 0;
    const cumulative = daily.map((day: any) => {
      tf += day.flags;
      td += day.deals;
      tn += day.nights;
      return { date: day.date, flags: tf, deals: td, nights: tn };
    });

    return { weekly, daily, cumulative };
  }, [currentData, selectedAgent]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Performance Report</h1>
      </div>

      {/* --- CONTROLS (ALWAYS VISIBLE) --- */}
      <Card variant="glass">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Year */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {/* Month */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          {/* Agent (Disable if no data) */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              Agent View
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              disabled={!currentData}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="all">All Agents</option>
              {currentData?.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.agentName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT OR EMPTY STATE --- */}
      {!currentData ? (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">No Data Available</h2>
          <p className="text-gray-500 mt-1">
            There is no data for{" "}
            <span className="font-semibold">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            .
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Go to the Targets page to initialize this month.
          </p>
        </div>
      ) : (
        <>
          {/* Charts */}
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
            <WeeklyBarChart
              data={processedData.weekly}
              title="Weekly Production Breakdown"
            />
          </div>

          <ZigzagChart
            data={processedData.daily}
            title="Daily Performance Volatility"
          />

          {/* Table */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">
              Weekly Summary Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Flags</th>
                    <th className="px-4 py-3 text-right">Deals</th>
                    <th className="px-4 py-3 text-right">Nights</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.weekly.map((w, idx) => (
                    <tr
                      key={w.week}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-4 py-3 font-medium">{w.week}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
