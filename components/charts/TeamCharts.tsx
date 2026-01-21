import React, { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Grid3x3 } from "lucide-react";
import {
  TeamPerformanceChartProps,
  TeamStats,
  OddsRecurrenceChartProps,
} from "@/types/all.types";

// Custom tooltip for team performance
const CustomPerformanceTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.team}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Avg HT Points:{" "}
            <span className="font-semibold">{data.avgPoints.toFixed(1)}</span>
          </p>
          <p className="text-red-600">
            Avg HT Conceded:{" "}
            <span className="font-semibold">{data.avgConceded.toFixed(1)}</span>
          </p>
          <p className="text-gray-600">
            Record:{" "}
            <span className="font-semibold">
              {data.wins}W - {data.losses}L
            </span>
          </p>
          <p className="text-gray-600">
            Games: <span className="font-semibold">{data.gamesPlayed}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for odds recurrence
const CustomOddsTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.team}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Home: <span className="font-semibold">{data.homeOccurrences}</span>{" "}
            ({data.homePercentage.toFixed(1)}%)
          </p>
          <p className="text-red-600">
            Away: <span className="font-semibold">{data.awayOccurrences}</span>{" "}
            ({data.awayPercentage.toFixed(1)}%)
          </p>
          <p className="text-gray-900 font-semibold mt-2">
            Total: {data.totalOccurrences}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Team Performance
export const TeamPerformanceSection: React.FC<
  TeamPerformanceChartProps & {
    StatsTable: React.ComponentType<{ stats: TeamStats[]; title: string }>;
  }
> = ({ data, title, location, threshold, StatsTable }) => {
  const sortedData = [...data].sort((a, b) => b.avgPoints - a.avgPoints);

  return (
    <Tabs defaultValue="table" className="w-full">
      <div className="flex items-center justify-between mb-4 mt-10">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <TabsList>
          <TabsTrigger value="table" className="gap-2 cursor-pointer">
            <Grid3x3 className="w-4 h-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-2 cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Chart
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chart" className="mt-0">
        <Card>
          <CardHeader>
            <CardDescription>
              Average halftime points scored and conceded per game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={sortedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="team"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: "#374151" }}
                  stroke="#9ca3af"
                />
                <YAxis
                  label={{
                    value: "Halftime Points",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#374151" },
                  }}
                  tick={{ fill: "#374151" }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomPerformanceTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                <Bar
                  dataKey="avgConceded"
                  fill="#ef4444"
                  name="Avg Points Conceded"
                  radius={[0, 0, 4, 4]}
                  stackId="stack"
                />
                <Bar
                  dataKey="avgPoints"
                  fill="#3b82f6"
                  name="Avg Points Scored"
                  radius={[4, 4, 0, 0]}
                  stackId="stack"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <StatsTable stats={data} title="" />
      </TabsContent>
    </Tabs>
  );
};

// Odds Recurrence
export const OddsRecurrenceSection: React.FC<
  OddsRecurrenceChartProps & {
    TeamRecurrenceTable: React.ComponentType;
  }
> = ({
  data,
  title = "Teams That Go Over Most Often",
  TeamRecurrenceTable,
}) => {
  const sortedData = [...data].sort(
    (a, b) => b.totalOccurrences - a.totalOccurrences,
  );

  return (
    <Tabs defaultValue="table" className="w-full pt-3">
      <div className="flex items-center justify-between mb-4 mt-10">
        <h2 className="font-bold text-gray-800">{title}</h2>
        <TabsList>
          <TabsTrigger value="table" className="gap-2 cursor-pointer">
            <Grid3x3 className="w-4 h-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-2 cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Chart
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="chart" className="mt-0">
        <Card>
          <CardHeader>
            <CardDescription>
              Number of times halftime total went over the odds line (stacked by
              home/away)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={sortedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="team"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: "#374151" }}
                  stroke="#9ca3af"
                />
                <YAxis
                  label={{
                    value: "Occurrences",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#374151" },
                  }}
                  tick={{ fill: "#374151" }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomOddsTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />

                <Bar
                  dataKey="homeOccurrences"
                  stackId="stack"
                  fill="#3b82f6"
                  name="Home Occurrences"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="awayOccurrences"
                  stackId="stack"
                  fill="#ef4444"
                  name="Away Occurrences"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <TeamRecurrenceTable />
      </TabsContent>
    </Tabs>
  );
};