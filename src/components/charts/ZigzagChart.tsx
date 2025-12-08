import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 1. Define the interface including 'weekday'
export interface ChartData {
  date: string;
  weekday: string; // Used for X-Axis Label
  flags: number;
  deals: number;
  nights: number;
}

interface ZigzagChartProps {
  data: ChartData[];
  title: string;
}

export const ZigzagChart: React.FC<ZigzagChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-900 font-bold mb-4">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="weekday"
              tick={{ fontSize: 12 }}
              interval={0} // Force show all labels if possible
            />
            <YAxis />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            {/* Using Bar Chart for daily volatility is often clearer than Line */}
            <Bar
              dataKey="flags"
              fill="#3b82f6"
              name="Flags"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="deals"
              fill="#22c55e"
              name="Deals"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="nights"
              fill="#a855f7"
              name="Nights"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
