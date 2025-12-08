import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Plus, Trash2, Edit2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import { ZigzagChart } from "../../components/charts/ZigzagChart";
import { type AgentTarget, type ViewMode } from "../../types/index";
import { isInCurrentMonth, isInCurrentWeek } from "../../lib/dataHelper";

interface AgentCardProps {
  agent: AgentTarget;
  viewMode: ViewMode;
  onDeleteAgent: (id: string) => void;
  onEditAgent: (agent: AgentTarget) => void;
  onAddDay: (agent: AgentTarget) => void;
  onDeleteDay: (agentId: string, recordId: string) => void;
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  viewMode,
  onDeleteAgent,
  onEditAgent,
  onAddDay,
  onDeleteDay,
}) => {
  // 1. Logic: Filter records based on View Mode
  const filteredRecords = useMemo(() => {
    return agent.dailyRecords
      .filter((record) => {
        if (viewMode === "weekly") return isInCurrentWeek(record.date);
        if (viewMode === "monthly") return isInCurrentMonth(record.date);
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  }, [agent.dailyRecords, viewMode]);

  // 2. Logic: Calculate Totals (Memoized)
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => ({
        flags: acc.flags + record.flags,
        deals: acc.deals + record.deals,
        nights: acc.nights + record.nights,
      }),
      { flags: 0, deals: 0, nights: 0 }
    );
  }, [filteredRecords]);

  // 3. Logic: Calculate Remaining (Based on Targets)
  // Note: Targets are usually monthly. If ViewMode is weekly,
  // you might want to divide target by 4, but usually, we compare Actual vs Monthly Target.
  const remaining = {
    flags: agent.targetFlags - totals.flags,
    deals: agent.targetDeals - totals.deals,
    nights: agent.targetNights - totals.nights,
  };

  // 4. Logic: Chart Data
  const chartData = useMemo(() => {
    const grouped = filteredRecords.reduce(
      (acc, record) => {
        const key = `Day ${record.weekdayIndex}`;
        if (!acc[key]) {
          acc[key] = { weekday: key, flags: 0, deals: 0, nights: 0 };
        }
        acc[key].flags += record.flags;
        acc[key].deals += record.deals;
        acc[key].nights += record.nights;
        return acc;
      },
      {} as Record<string, any>
    );
    return Object.values(grouped);
  }, [filteredRecords]);

  // UX: Delete Confirmation
  const confirmDeleteAgent = () => {
    if (
      window.confirm(
        `Are you sure you want to delete agent ${agent.agentName}?`
      )
    ) {
      onDeleteAgent(agent.id);
    }
  };

  const confirmDeleteDay = (recordId: string) => {
    if (window.confirm("Are you sure you want to delete this daily record?")) {
      onDeleteDay(agent.id, recordId);
    }
  };

  return (
    <Card variant="glass">
      {/* Agent Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">{agent.agentName}</h3>
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {viewMode} View
          </span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEditAgent(agent)}>
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={confirmDeleteAgent}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash size={16} />
          </Button>
        </div>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium">Target Flags</p>
          <p className="text-blue-900 mt-1 font-bold">{agent.targetFlags}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Target Deals</p>
          <p className="text-green-900 mt-1 font-bold">{agent.targetDeals}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-orange-600 font-medium">Target Nights</p>
          <p className="text-orange-900 mt-1 font-bold">{agent.targetNights}</p>
        </div>
      </div>

      {/* Current Totals (Filtered) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600">Total Flags</p>
          <p className="text-gray-900 mt-1 font-semibold">{totals.flags}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600">Total Deals</p>
          <p className="text-gray-900 mt-1 font-semibold">{totals.deals}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600">Total Nights</p>
          <p className="text-gray-900 mt-1 font-semibold">{totals.nights}</p>
        </div>
      </div>

      {/* Remaining */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div
          className={`rounded-lg p-3 ${remaining.flags >= 0 ? "bg-gray-50" : "bg-red-50"}`}
        >
          <p className="text-xs text-gray-600">Rem. Flags</p>
          <p
            className={`mt-1 font-bold ${remaining.flags >= 0 ? "text-gray-900" : "text-red-600"}`}
          >
            {remaining.flags}
          </p>
        </div>
        <div
          className={`rounded-lg p-3 ${remaining.deals >= 0 ? "bg-gray-50" : "bg-red-50"}`}
        >
          <p className="text-xs text-gray-600">Rem. Deals</p>
          <p
            className={`mt-1 font-bold ${remaining.deals >= 0 ? "text-gray-900" : "text-red-600"}`}
          >
            {remaining.deals}
          </p>
        </div>
        <div
          className={`rounded-lg p-3 ${remaining.nights >= 0 ? "bg-gray-50" : "bg-red-50"}`}
        >
          <p className="text-xs text-gray-600">Rem. Nights</p>
          <p
            className={`mt-1 font-bold ${remaining.nights >= 0 ? "text-gray-900" : "text-red-600"}`}
          >
            {remaining.nights}
          </p>
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-900 font-medium">
            Daily Records ({viewMode})
          </h4>
          <Button size="sm" onClick={() => onAddDay(agent)}>
            <Plus size={14} className="mr-1" /> Add Day
          </Button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              No records for this {viewMode}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left text-gray-700">Date</th>
                  <th className="px-2 py-2 text-left text-gray-700">Day</th>
                  <th className="px-2 py-2 text-right text-gray-700">F</th>
                  <th className="px-2 py-2 text-right text-gray-700">D</th>
                  <th className="px-2 py-2 text-right text-gray-700">N</th>
                  <th className="px-2 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-2 py-2 text-gray-900">{record.date}</td>
                      <td className="px-2 py-2 text-gray-900">
                        {weekdays[record.weekdayIndex - 1]}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-900">
                        {record.flags}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-900">
                        {record.deals}
                      </td>
                      <td className="px-2 py-2 text-right text-gray-900">
                        {record.nights}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => confirmDeleteDay(record.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ZigzagChart data={chartData} title="Performance Trends" />
        </div>
      )}
    </Card>
  );
};
