import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { type AgentTarget } from "../../types/index";

interface AgentCardProps {
  agent: AgentTarget;
  // New Props for correct filtering
  selectedYear: number;
  selectedMonthIndex: number;

  onDeleteAgent: (id: string) => void;
  onEditAgent: (agent: AgentTarget) => void;
  onAddDay: (agent: AgentTarget) => void;
  onDeleteDay: (agentId: string, recordId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  selectedYear,
  selectedMonthIndex,
  onDeleteAgent,
  onEditAgent,
  onAddDay,
  onDeleteDay,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. FIXED LOGIC: Filter based on the Dashboard's Selection, not "Today"
  const filteredRecords = useMemo(() => {
    return agent.dailyRecords
      .filter((record) => {
        const d = new Date(record.date);
        return (
          d.getFullYear() === selectedYear &&
          d.getMonth() === selectedMonthIndex
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [agent.dailyRecords, selectedYear, selectedMonthIndex]);

  // 2. Calculate Totals based on filtered records
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => ({
        flags: acc.flags + r.flags,
        deals: acc.deals + r.deals,
        nights: acc.nights + r.nights,
      }),
      { flags: 0, deals: 0, nights: 0 }
    );
  }, [filteredRecords]);

  // Helper for progress bars
  const ProgressBar = ({ value, target, color }: any) => {
    const percent = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    return (
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 transition-all duration-500`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* --- DESKTOP ROW LAYOUT --- */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
        {/* Name */}
        <div className="col-span-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {agent.agentName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">
              {agent.agentName}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <FileText size={10} />
              <span>{filteredRecords.length} records</span>
            </div>
          </div>
        </div>

        {/* Targets */}
        <div className="col-span-3 grid grid-cols-3 gap-2 text-center text-xs text-gray-400 font-medium">
          <div title="Target Flags">T: {agent.targetFlags}</div>
          <div title="Target Deals">T: {agent.targetDeals}</div>
          <div title="Target Nights">T: {agent.targetNights}</div>
        </div>

        {/* Actuals */}
        <div className="col-span-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="font-bold text-blue-600">{totals.flags}</div>
          <div className="font-bold text-green-600">{totals.deals}</div>
          <div className="font-bold text-purple-600">{totals.nights}</div>
        </div>

        {/* Progress */}
        <div className="col-span-2 flex flex-col gap-1.5 pr-2">
          <ProgressBar
            value={totals.flags}
            target={agent.targetFlags}
            color="blue"
          />
          <ProgressBar
            value={totals.deals}
            target={agent.targetDeals}
            color="green"
          />
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end items-center gap-1">
          <button
            onClick={() => onAddDay(agent)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Add Day"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEditAgent(agent)}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full"
            title="Settings"
          >
            <Edit2 size={16} />
          </button>

          {/* EXPAND BUTTON */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-full transition-colors ${isExpanded ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:bg-gray-50"}`}
            title="View Details"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE LAYOUT --- */}
      <div className="md:hidden p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {agent.agentName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{agent.agentName}</h4>
              <p className="text-xs text-gray-500">
                {filteredRecords.length} records
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddDay(agent)}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
          <div>
            <span className="text-xs text-gray-400 uppercase">Flags</span>
            <p className="font-bold text-blue-600 text-lg">
              {totals.flags}{" "}
              <span className="text-gray-300 text-xs font-normal">
                / {agent.targetFlags}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase">Deals</span>
            <p className="font-bold text-green-600 text-lg">
              {totals.deals}{" "}
              <span className="text-gray-300 text-xs font-normal">
                / {agent.targetDeals}
              </span>
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase">Nights</span>
            <p className="font-bold text-purple-600 text-lg">
              {totals.nights}{" "}
              <span className="text-gray-300 text-xs font-normal">
                / {agent.targetNights}
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-2">
          <button
            onClick={() => onEditAgent(agent)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <Edit2 size={12} /> Edit Agent
          </button>
          <button
            onClick={() => {
              if (window.confirm("Delete?")) onDeleteAgent(agent.id);
            }}
            className="text-xs text-red-300 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      {/* --- EXPANDED RECORDS TABLE (Common) --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-4">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No daily records found for this month.
                </div>
              ) : (
                <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2 text-right text-blue-600">
                          Flags
                        </th>
                        <th className="px-4 py-2 text-right text-green-600">
                          Deals
                        </th>
                        <th className="px-4 py-2 text-right text-purple-600">
                          Nights
                        </th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRecords.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-4 py-2 font-medium text-gray-700">
                            {r.date}
                          </td>
                          <td className="px-4 py-2 text-right">{r.flags}</td>
                          <td className="px-4 py-2 text-right">{r.deals}</td>
                          <td className="px-4 py-2 text-right">{r.nights}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm("Delete record?"))
                                  onDeleteDay(agent.id, r.id);
                              }}
                              className="text-gray-300 hover:text-red-500 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
