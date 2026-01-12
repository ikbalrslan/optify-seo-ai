"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Jan", revenue: 2400 },
  { name: "Feb", revenue: 1398 },
  { name: "Mar", revenue: 9800 },
  { name: "Apr", revenue: 3908 },
  { name: "May", revenue: 4800 },
  { name: "Jun", revenue: 3800 },
  { name: "Jul", revenue: 4300 },
];

export function RevenueChart() {
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
          tickFormatter={(value: number) => `$${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
        <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={3}
          activeDot={{ r: 8, fill: "#2563eb", strokeWidth: 0 }}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
