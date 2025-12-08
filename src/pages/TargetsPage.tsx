import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Calendar, Edit2, Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { InputField } from "../components/ui/InputField";
import { ModalForm } from "../components/ui/ModalForm";
import { toast } from "sonner";
import { saveMonthlyData, getMonthlyData } from "../services/JsonService";
import { AgentCard } from "../components/layout/AgentCard";
import {
  getWeekdayIndex,
  generateYearOptions,
  MONTH_NAMES,
} from "../lib/dataHelper";
import {
  type TeamTargets,
  type AgentTarget,
  type DailyRecord,
} from "../types/index";

export const TargetsPage: React.FC = () => {
  // --- STATE ---
  const [currentData, setCurrentData] = useState<TeamTargets | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    new Date().getMonth()
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);

  // Selection
  const [selectedAgent, setSelectedAgent] = useState<AgentTarget | null>(null);

  // Forms
  const [teamForm, setTeamForm] = useState({
    teamName: "Sales Team",
    targetFlags: "",
    targetDeals: "",
    targetNights: "",
  });

  const [agentForm, setAgentForm] = useState({
    id: "",
    agentName: "",
    targetFlags: "",
    targetDeals: "",
    targetNights: "",
  });

  const [dayForm, setDayForm] = useState({
    date: "", // Initialized empty, set on open
    flags: "",
    deals: "",
    nights: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const years = generateYearOptions();

  // --- INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonthIndex]);

  const loadData = async () => {
    try {
      const data = await getMonthlyData(selectedYear, selectedMonthIndex);

      if (data) {
        setCurrentData(data);
      } else {
        setCurrentData({
          teamId: `month-${selectedYear}-${selectedMonthIndex}`,
          teamName: "Sales Team",
          month: selectedMonthIndex,
          year: selectedYear,
          targetFlags: 0,
          targetDeals: 0,
          targetNights: 0,
          agents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);

        toast.info(
          `No data for ${MONTH_NAMES[selectedMonthIndex]}. Set targets to begin.`
        );
        setIsEditTeamModalOpen(true);
      }
    } catch (e) {
      toast.error("Failed to load data");
    }
  };

  // --- CALCULATIONS & VALIDATION (Kept same as before) ---
  const teamAggregates = useMemo(() => {
    if (!currentData) return { flags: 0, deals: 0, nights: 0 };
    return currentData.agents.reduce(
      (acc, agent) => {
        const agentTotals = agent.dailyRecords.reduce(
          (dAcc, r) => ({
            flags: dAcc.flags + r.flags,
            deals: dAcc.deals + r.deals,
            nights: dAcc.nights + r.nights,
          }),
          { flags: 0, deals: 0, nights: 0 }
        );

        return {
          flags: acc.flags + agentTotals.flags,
          deals: acc.deals + agentTotals.deals,
          nights: acc.nights + agentTotals.nights,
        };
      },
      { flags: 0, deals: 0, nights: 0 }
    );
  }, [currentData]);

  const filteredAgents = useMemo(() => {
    if (!currentData) return [];
    if (!searchTerm.trim()) return currentData.agents;
    return currentData.agents.filter((a) =>
      a.agentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentData, searchTerm]);

  const validateAgentForm = (values: any, isEdit: boolean) => {
    const newErrors: Record<string, string> = {};
    if (!currentData) return false;
    if (!values.agentName.trim()) newErrors.agentName = "Required";

    // Check remaining logic...
    let usedFlags = 0;
    let usedDeals = 0;
    let usedNights = 0;
    currentData.agents.forEach((agent) => {
      if (isEdit && agent.id === values.id) return;
      usedFlags += agent.targetFlags;
      usedDeals += agent.targetDeals;
      usedNights += agent.targetNights;
    });

    const vFlags = Number(values.targetFlags);
    const vDeals = Number(values.targetDeals);
    const vNights = Number(values.targetNights);

    if (vFlags > currentData.targetFlags - usedFlags)
      newErrors.targetFlags = "Exceeds Team Limit";
    if (vDeals > currentData.targetDeals - usedDeals)
      newErrors.targetDeals = "Exceeds Team Limit";
    if (vNights > currentData.targetNights - usedNights)
      newErrors.targetNights = "Exceeds Team Limit";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTeamForm = () => {
    const newErrors: Record<string, string> = {};
    if (!teamForm.teamName.trim()) newErrors.teamName = "Required";
    if (!teamForm.targetFlags) newErrors.targetFlags = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---

  const handleUpdateTeam = async () => {
    if (!currentData || !validateTeamForm()) return;
    const updatedData = {
      ...currentData,
      teamName: teamForm.teamName,
      targetFlags: Number(teamForm.targetFlags),
      targetDeals: Number(teamForm.targetDeals),
      targetNights: Number(teamForm.targetNights),
      month: selectedMonthIndex,
      year: selectedYear,
    };
    setCurrentData(updatedData);
    await saveMonthlyData(updatedData);
    setIsEditTeamModalOpen(false);
    toast.success("Targets updated");
  };

  const handleSaveAgent = async (isEdit: boolean) => {
    if (!currentData || !validateAgentForm(agentForm, isEdit)) return;

    let updatedAgents = [...currentData.agents];
    if (isEdit) {
      const index = updatedAgents.findIndex((a) => a.id === agentForm.id);
      if (index > -1) {
        updatedAgents[index] = {
          ...updatedAgents[index],
          agentName: agentForm.agentName,
          targetFlags: Number(agentForm.targetFlags),
          targetDeals: Number(agentForm.targetDeals),
          targetNights: Number(agentForm.targetNights),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      updatedAgents.push({
        id: `agent-${Date.now()}`,
        agentName: agentForm.agentName,
        targetFlags: Number(agentForm.targetFlags),
        targetDeals: Number(agentForm.targetDeals),
        targetNights: Number(agentForm.targetNights),
        dailyRecords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const updatedData = { ...currentData, agents: updatedAgents };
    setCurrentData(updatedData);
    await saveMonthlyData(updatedData);
    setIsAddAgentModalOpen(false);
    setIsEditAgentModalOpen(false);
    toast.success(isEdit ? "Agent updated" : "Agent added");
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!currentData || !window.confirm("Delete this agent?")) return;
    const updatedData = {
      ...currentData,
      agents: currentData.agents.filter((a) => a.id !== agentId),
    };
    setCurrentData(updatedData);
    await saveMonthlyData(updatedData);
    toast.success("Agent deleted");
  };

  // --- UPDATED ADD DAY LOGIC ---
  const handleOpenAddDay = (agent: AgentTarget) => {
    setSelectedAgent(agent);

    // 1. Calculate Default Date based on Selection
    const now = new Date();
    let defaultDateStr = "";

    if (
      selectedYear === now.getFullYear() &&
      selectedMonthIndex === now.getMonth()
    ) {
      // If current month is selected, default to Today
      defaultDateStr = now.toISOString().split("T")[0];
    } else {
      // If another month is selected, default to the 1st of that month
      // Format: YYYY-MM-DD
      const y = selectedYear;
      const m = String(selectedMonthIndex + 1).padStart(2, "0");
      defaultDateStr = `${y}-${m}-01`;
    }

    setDayForm({
      date: defaultDateStr,
      flags: "",
      deals: "",
      nights: "",
    });
    setErrors({});
    setIsAddDayModalOpen(true);
  };

  const handleAddDay = async () => {
    if (!selectedAgent || !currentData) return;
    // Basic validation
    if (!dayForm.date) {
      setErrors({ date: "Required" });
      return;
    }

    const record: DailyRecord = {
      id: `rec-${Date.now()}`,
      date: dayForm.date,
      weekdayIndex: getWeekdayIndex(dayForm.date),
      flags: Number(dayForm.flags),
      deals: Number(dayForm.deals),
      nights: Number(dayForm.nights),
    };

    const updatedAgents = currentData.agents.map((a) =>
      a.id === selectedAgent.id
        ? { ...a, dailyRecords: [...a.dailyRecords, record] }
        : a
    );

    const updatedData = { ...currentData, agents: updatedAgents };
    setCurrentData(updatedData);
    await saveMonthlyData(updatedData);
    setIsAddDayModalOpen(false);
    toast.success("Record Added");
  };

  const handleDeleteDay = async (agentId: string, recId: string) => {
    if (!currentData) return;
    const updatedAgents = currentData.agents.map((a) =>
      a.id === agentId
        ? { ...a, dailyRecords: a.dailyRecords.filter((r) => r.id !== recId) }
        : a
    );
    const updatedData = { ...currentData, agents: updatedAgents };
    setCurrentData(updatedData);
    await saveMonthlyData(updatedData);
  };

  // --- HELPER FOR MODAL LIMITS ---
  const getMonthDateLimits = () => {
    // Calculate min and max date strings (YYYY-MM-DD) for the selected month
    const min = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}-01`;
    // Get last day of month
    const lastDay = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
    const max = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, "0")}-${lastDay}`;
    return { min, max };
  };

  // --- RENDER ---
  if (!currentData)
    return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">
            {MONTH_NAMES[selectedMonthIndex]} {selectedYear}
          </h1>
          <p className="text-gray-500 text-sm">
            {currentData.teamName} Targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setTeamForm({
                teamName: currentData.teamName,
                targetFlags: String(currentData.targetFlags),
                targetDeals: String(currentData.targetDeals),
                targetNights: String(currentData.targetNights),
              });
              setIsEditTeamModalOpen(true);
            }}
            variant="outline"
          >
            <Edit2 size={16} className="mr-2" /> Team Targets
          </Button>
          <Button
            onClick={() => {
              setAgentForm({
                id: "",
                agentName: "",
                targetFlags: "",
                targetDeals: "",
                targetNights: "",
              });
              setIsAddAgentModalOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Add Agent
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={20} />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={selectedMonthIndex}
            onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
            className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none w-64"
          />
        </div>
      </div>

      {/* OVERVIEW CARDS (Same as before) */}
      <Card variant="gradient">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 rounded-lg p-4 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Flags
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-blue-900">
                {teamAggregates.flags}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {" "}
                / {currentData.targetFlags}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{
                  width: `${Math.min((teamAggregates.flags / currentData.targetFlags) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          {/* ... Deals and Nights blocks ... */}
          <div className="bg-white/90 rounded-lg p-4 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Deals
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-green-900">
                {teamAggregates.deals}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {" "}
                / {currentData.targetDeals}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
              <div
                className="bg-green-600 h-full rounded-full"
                style={{
                  width: `${Math.min((teamAggregates.deals / currentData.targetDeals) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="bg-white/90 rounded-lg p-4 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Nights
            </span>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-purple-900">
                {teamAggregates.nights}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {" "}
                / {currentData.targetNights}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{
                  width: `${Math.min((teamAggregates.nights / currentData.targetNights) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* AGENTS LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AgentCard
                agent={agent}
                viewMode="monthly"
                onDeleteAgent={handleDeleteAgent}
                onEditAgent={(a) => {
                  setAgentForm({
                    id: a.id,
                    agentName: a.agentName,
                    targetFlags: String(a.targetFlags),
                    targetDeals: String(a.targetDeals),
                    targetNights: String(a.targetNights),
                  });
                  setIsEditAgentModalOpen(true);
                }}
                onAddDay={handleOpenAddDay} // Pass the updated handler
                onDeleteDay={handleDeleteDay}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <ModalForm
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        title="Edit Team Targets"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateTeam();
          }}
          className="space-y-4"
        >
          <InputField
            label="Team Name"
            name="teamName"
            value={teamForm.teamName}
            onChange={(e) =>
              setTeamForm({ ...teamForm, teamName: e.target.value })
            }
            error={errors.teamName}
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <InputField
              name=""
              label="Target Flags"
              type="number"
              value={teamForm.targetFlags}
              onChange={(e) =>
                setTeamForm({ ...teamForm, targetFlags: e.target.value })
              }
              error={errors.targetFlags}
            />
            <InputField
              name=""
              label="Target Deals"
              type="number"
              value={teamForm.targetDeals}
              onChange={(e) =>
                setTeamForm({ ...teamForm, targetDeals: e.target.value })
              }
              error={errors.targetDeals}
            />
            <InputField
              name=""
              label="Target Nights"
              type="number"
              value={teamForm.targetNights}
              onChange={(e) =>
                setTeamForm({ ...teamForm, targetNights: e.target.value })
              }
              error={errors.targetNights}
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Save
          </Button>
        </form>
      </ModalForm>

      <ModalForm
        isOpen={isAddAgentModalOpen || isEditAgentModalOpen}
        onClose={() => {
          setIsAddAgentModalOpen(false);
          setIsEditAgentModalOpen(false);
        }}
        title={isEditAgentModalOpen ? "Edit Agent" : "Add Agent"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAgent(isEditAgentModalOpen);
          }}
          className="space-y-4"
        >
          <InputField
            name=""
            label="Agent Name"
            value={agentForm.agentName}
            onChange={(e) =>
              setAgentForm({ ...agentForm, agentName: e.target.value })
            }
            error={errors.agentName}
          />
          {/* Note: Insert the "Remaining Budget" calculation UI here if needed, same as previous response */}
          <div className="grid grid-cols-3 gap-2">
            <InputField
              name=""
              label="Flags"
              type="number"
              value={agentForm.targetFlags}
              onChange={(e) =>
                setAgentForm({ ...agentForm, targetFlags: e.target.value })
              }
              error={errors.targetFlags}
            />
            <InputField
              name=""
              label="Deals"
              type="number"
              value={agentForm.targetDeals}
              onChange={(e) =>
                setAgentForm({ ...agentForm, targetDeals: e.target.value })
              }
              error={errors.targetDeals}
            />
            <InputField
              name=""
              label="Nights"
              type="number"
              value={agentForm.targetNights}
              onChange={(e) =>
                setAgentForm({ ...agentForm, targetNights: e.target.value })
              }
              error={errors.targetNights}
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Save
          </Button>
        </form>
      </ModalForm>

      {/* ADD DAY MODAL - WITH CONSTRAINTS */}
      <ModalForm
        isOpen={isAddDayModalOpen}
        onClose={() => setIsAddDayModalOpen(false)}
        title={`Add Record - ${selectedAgent?.agentName}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddDay();
          }}
          className="space-y-4"
        >
          {/* UPDATED DATE INPUT WITH MIN/MAX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={dayForm.date}
              min={getMonthDateLimits().min}
              max={getMonthDateLimits().max}
              onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Selecting for: {MONTH_NAMES[selectedMonthIndex]} {selectedYear}
            </p>
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <InputField
              name=""
              label="Flags"
              type="number"
              value={dayForm.flags}
              onChange={(e) =>
                setDayForm({ ...dayForm, flags: e.target.value })
              }
            />
            <InputField
              name=""
              label="Deals"
              type="number"
              value={dayForm.deals}
              onChange={(e) =>
                setDayForm({ ...dayForm, deals: e.target.value })
              }
            />
            <InputField
              name=""
              label="Nights"
              type="number"
              value={dayForm.nights}
              onChange={(e) =>
                setDayForm({ ...dayForm, nights: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Save Record
          </Button>
        </form>
      </ModalForm>
    </div>
  );
};
