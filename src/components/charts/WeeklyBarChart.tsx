import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";

interface WeeklyData {
  week: string;
  flags: number;
  deals: number;
  nights: number;
}

interface WeeklyBarChartProps {
  data: WeeklyData[];
  title?: string;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  title = "Weekly Performance Breakdown",
}) => {
  return (
    <Card>
      <h3 className="text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar
            dataKey="flags"
            fill="#3b82f6"
            name="Flags"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="deals"
            fill="#10b981"
            name="Deals"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="nights"
            fill="#f59e0b"
            name="Nights"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
