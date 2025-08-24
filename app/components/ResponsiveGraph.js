"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  defs,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"

export default function ResponsiveGraph({
  title = "Analytics",
  data = [],
  xData = "date",
  yData = "value",
  timeframe = "daily",
  chartType = "line", // "line" | "area"
  className = "",
}) {
  const chartData = useMemo(() => data, [data])

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <ChartContainer>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={xData} stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey={yData}
                stroke="#22c55e"
                fill="url(#fillGreen)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={xData} stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey={yData}
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#22c55e", fill: "#1a1a1a" }} // visible points
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
