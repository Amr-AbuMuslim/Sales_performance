// Type definitions for the Performance Management Dashboard

export interface DailyRecord {
  id: string;
  date: string;
  weekdayIndex: number; // 1-7 (Mon-Sun)
  flags: number;
  deals: number;
  nights: number;
}

// src/types/index.ts

export interface Agent {
  agentId: string;
  name: string;
  targetFlags?: number;
  targetDeals?: number;
  targetNights?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentTarget {
  id: string;
  agentName: string;
  targetFlags: number;
  targetDeals: number;
  targetNights: number;
  dailyRecords: DailyRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamTargets {
  teamId: string;
  teamName: string;
  targetFlags: number;
  targetDeals: number;
  targetNights: number;
  agents: AgentTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface CountdownEntry {
  id: string;
  salesAgent: string;
  dealDate: string;
  companyName: string;
  totalNights: number;
  createdAt: string;
}

export interface CountdownData {
  targetNights: number;
  entries: CountdownEntry[];
}

export type ViewMode = "weekly" | "monthly";

export interface WeeklySummary {
  weekNumber: number;
  flags: number;
  deals: number;
  nights: number;
}
