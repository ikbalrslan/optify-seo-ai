"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Mon", analyses: 4 },
  { name: "Tue", analyses: 3 },
  { name: "Wed", analyses: 7 },
  { name: "Thu", analyses: 2 },
  { name: "Fri", analyses: 6 },
  { name: "Sat", analyses: 1 },
  { name: "Sun", analyses: 0 },
];

export function UsageChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
        <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#10b981', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="analyses"
          stroke="#10b981"
          strokeWidth={3}
          activeDot={{ r: 8, fill: "#047857", strokeWidth: 0 }}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
