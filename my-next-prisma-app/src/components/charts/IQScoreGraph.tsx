"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

interface IQDataPoint {
  date: string;
  score: number;
  quizzesTaken?: number;
}

interface IQScoreGraphProps {
  data?: IQDataPoint[];
  currentIQ?: number;
  height?: number;
  showTrend?: boolean;
}

// Generate mock data if none provided
const generateMockData = (): IQDataPoint[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const baseScore = 100;

  return months.map((month, index) => ({
    date: month,
    score: Math.round(
      baseScore + Math.sin(index * 0.8) * 15 + Math.random() * 10 + index * 2
    ),
    quizzesTaken: Math.floor(Math.random() * 20) + 5,
  }));
};

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: IQDataPoint }[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const score = data.value;
  const quizzes = data.payload.quizzesTaken;

  // IQ category based on score
  const getCategory = (iq: number) => {
    if (iq >= 130) return { label: "Gifted", color: "#a855f7" };
    if (iq >= 120) return { label: "Superior", color: "#22c55e" };
    if (iq >= 110) return { label: "Above Average", color: "#3b82f6" };
    if (iq >= 90) return { label: "Average", color: "#f59e0b" };
    if (iq >= 80) return { label: "Below Average", color: "#ef4444" };
    return { label: "Low", color: "#dc2626" };
  };

  const category = getCategory(score);

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
      <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-lg font-bold" style={{ color: category.color }}>
        IQ: {score}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {category.label}
      </p>
      {quizzes && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {quizzes} quizzes taken
        </p>
      )}
    </div>
  );
};

export function IQScoreGraph({
  data,
  currentIQ = 115,
  height = 200,
  showTrend = true,
}: IQScoreGraphProps) {
  const chartData = data || generateMockData();

  // Calculate average IQ
  const avgIQ = Math.round(
    chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
  );

  // Gradient colors based on performance
  const getGradientColor = () => {
    if (currentIQ >= 120) return { start: "#a855f7", end: "#6366f1" }; // Purple to Indigo
    if (currentIQ >= 100) return { start: "#22c55e", end: "#3b82f6" }; // Green to Blue
    return { start: "#f59e0b", end: "#ef4444" }; // Yellow to Red
  };

  const gradientColors = getGradientColor();

  return (
    <div className="w-full">
      {/* Stats header */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentIQ}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Current IQ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Avg: {avgIQ}
          </span>
          {currentIQ > avgIQ ? (
            <span className="text-xs text-green-500">
              ↑ {currentIQ - avgIQ} above avg
            </span>
          ) : (
            <span className="text-xs text-amber-500">
              ↓ {avgIQ - currentIQ} below avg
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="iqGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={gradientColors.start}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={gradientColors.end}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
            className="dark:stroke-slate-700"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[70, 150]}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            ticks={[80, 100, 120, 140]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Reference lines for IQ categories */}
          <ReferenceLine
            y={100}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{
              value: "Avg",
              position: "right",
              fill: "#9ca3af",
              fontSize: 10,
            }}
          />

          {/* Area fill */}
          <Area
            type="monotone"
            dataKey="score"
            fill="url(#iqGradient)"
            stroke="none"
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{
              fill: gradientColors.start,
              stroke: "#fff",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: gradientColors.start,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-gray-500 dark:text-gray-400">
            Gifted (130+)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-500 dark:text-gray-400">
            Superior (120+)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-500 dark:text-gray-400">
            Above Avg (110+)
          </span>
        </div>
      </div>
    </div>
  );
}

export default IQScoreGraph;
