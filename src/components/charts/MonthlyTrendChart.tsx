import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 1. Define the interface to match your ReportsPage data exactly
export interface MonthlyTrendData {
  date: string;
  flags: number;
  deals: number;
  nights: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
  targets: {
    flags: number;
    deals: number;
    nights: number;
  };
  title: string;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  targets,
  title,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-900 font-bold mb-4">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => new Date(val).getDate().toString()} // Show only day number
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />

            {/* Actual Performance Lines */}
            <Line
              type="monotone"
              dataKey="flags"
              stroke="#2563eb" // Blue
              strokeWidth={2}
              dot={false}
              name="Actual Flags"
            />
            <Line
              type="monotone"
              dataKey="deals"
              stroke="#16a34a" // Green
              strokeWidth={2}
              dot={false}
              name="Actual Deals"
            />
            <Line
              type="monotone"
              dataKey="nights"
              stroke="#9333ea" // Purple
              strokeWidth={2}
              dot={false}
              name="Actual Nights"
            />

            {/* Target Reference Lines (Dashed) */}
            {targets.flags > 0 && (
              <ReferenceLine
                y={targets.flags}
                stroke="#2563eb"
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: "Flag Goal",
                  fill: "#2563eb",
                  fontSize: 10,
                }}
              />
            )}
            {targets.deals > 0 && (
              <ReferenceLine
                y={targets.deals}
                stroke="#16a34a"
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: "Deal Goal",
                  fill: "#16a34a",
                  fontSize: 10,
                }}
              />
            )}
            {targets.nights > 0 && (
              <ReferenceLine
                y={targets.nights}
                stroke="#9333ea"
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: "Night Goal",
                  fill: "#9333ea",
                  fontSize: 10,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
