"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Grid3x3 } from "lucide-react";
import {
  TeamPerformanceChartProps,
  TeamStats,
  OddsRecurrenceChartProps,
  TeamOddsRecurrence,
} from "@/types/all.types";

type SortKey = "avgPoints" | "avgConceded" | "winLoss";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "avgPoints", label: "Avg Pts" },
  { key: "avgConceded", label: "Avg Con" },
  { key: "winLoss", label: "W-L" },
];

function sortStats(data: TeamStats[], sortBy: SortKey): TeamStats[] {
  return [...data].sort((a, b) => {
    if (sortBy === "avgConceded") return b.avgConceded - a.avgConceded;
    if (sortBy === "winLoss") return b.wins - b.losses - (a.wins - a.losses);
    return b.avgPoints - a.avgPoints;
  });
}

const CHART_HEIGHT = 400;

function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWidth(Math.floor(w));
    });

    observer.observe(el);

    const initial = el.getBoundingClientRect().width;
    if (initial > 0) setWidth(Math.floor(initial));

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const ChartContainer = ({
  children,
  dataLength,
}: {
  children: (width: number) => React.ReactElement;
  dataLength: number;
}) => {
  const { ref, width } = useChartWidth();
  const chartWidth = width > 0 ? Math.max(width, dataLength * 42 + 80) : 0;

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      {chartWidth > 0 && (
        <div style={{ width: chartWidth, height: CHART_HEIGHT }}>
          {children(chartWidth)}
        </div>
      )}
    </div>
  );
};

type Hidden = Record<string, boolean>;

function useToggleBars() {
  const [hidden, setHidden] = useState<Hidden>({});
  const toggle = useCallback(
    (key: string) => setHidden((p) => ({ ...p, [key]: !p[key] })),
    [],
  );
  return { hidden, toggle };
}

type HiddenBars = Record<string, boolean>;

function orderedLegend(
  order: string[],
  hidden: HiddenBars,
  toggle: (key: string) => void,
) {
  return ({ payload }: any) => {
    const sorted = order
      .map((key) => payload?.find((p: any) => p.dataKey === key))
      .filter(Boolean);
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-4">
        {sorted.map((entry: any) => (
          <li
            key={entry.dataKey}
            onClick={() => toggle(entry.dataKey)}
            className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
            style={{ opacity: hidden[entry.dataKey] ? 0.35 : 1 }}
          >
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };
}

const CustomPerformanceTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-2">{d.team}</p>
      <p className="text-blue-600">
        Avg HT Points:{" "}
        <span className="font-semibold">{d.avgPoints.toFixed(1)}</span>
      </p>
      <p className="text-red-600">
        Avg HT Conceded:{" "}
        <span className="font-semibold">{d.avgConceded.toFixed(1)}</span>
      </p>
      <p className="text-gray-600">
        Record:{" "}
        <span className="font-semibold">
          {d.wins}W - {d.losses}L
        </span>
      </p>
      <p className="text-gray-600">
        Games: <span className="font-semibold">{d.gamesPlayed}</span>
      </p>
    </div>
  );
};

const CustomOddsTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg text-sm">
      <p className="font-semibold text-gray-900 mb-2">{d.team}</p>
      <p className="text-blue-600">
        Home: <span className="font-semibold">{d.homeOccurrences}</span> (
        {d.homePercentage.toFixed(1)}%)
      </p>
      <p className="text-red-600">
        Away: <span className="font-semibold">{d.awayOccurrences}</span> (
        {d.awayPercentage.toFixed(1)}%)
      </p>
      <p className="text-gray-900 font-semibold mt-2">
        Total: {d.totalOccurrences}
      </p>
    </div>
  );
};

export const TeamPerformanceSection: React.FC<
  TeamPerformanceChartProps & {
    oddsType: "over" | "under";
    StatsTable: React.ComponentType<{
      stats: TeamStats[];
      title: string;
      oddsType: "over" | "under";
      threshold: number;
      sortBy?: SortKey;
    }>;
  }
> = ({ data, title, threshold, oddsType, StatsTable }) => {
  const [sortBy, setSortBy] = useState<SortKey>("avgPoints");
  const sortedData = sortStats(data, sortBy);
  const { hidden, toggle } = useToggleBars();

  return (
    <Tabs defaultValue="table" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-y-3 mb-4 mt-10">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort pill */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <span className="text-xs text-gray-500 px-1 select-none">
              Sort:
            </span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
      </div>

      <TabsContent value="chart" className="mt-0">
        <Card>
          <CardHeader>
            <CardDescription>
              Average halftime points scored and conceded per game.{" "}
              <span className="text-gray-400">Tap legend to show/hide.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer dataLength={sortedData.length}>
              {(w) => (
                <BarChart
                  width={w}
                  height={CHART_HEIGHT}
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
                      position: "insideBottomLeft",
                      style: { fill: "#374151" },
                    }}
                    tick={{ fill: "#374151" }}
                    stroke="#9ca3af"
                  />
                  <Tooltip content={<CustomPerformanceTooltip />} />
                  <Legend
                    content={orderedLegend(
                      ["avgPoints", "avgConceded"],
                      hidden,
                      toggle,
                    )}
                    iconType="rect"
                  />
                  <Bar
                    dataKey="avgConceded"
                    fill="#ef4444"
                    name="Avg Points Conceded"
                    radius={[0, 0, 0, 0]}
                    stackId="stack"
                    hide={!!hidden["avgConceded"]}
                  />
                  <Bar
                    dataKey="avgPoints"
                    fill="#3b82f6"
                    name="Avg Points Scored"
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                    hide={!!hidden["avgPoints"]}
                  />
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <StatsTable
          stats={sortedData}
          title=""
          oddsType={oddsType}
          threshold={threshold}
          sortBy={sortBy}
        />
      </TabsContent>
    </Tabs>
  );
};

export const OddsRecurrenceSection: React.FC<
  OddsRecurrenceChartProps & {
    oddsType: "over" | "under";
    TeamRecurrenceTable: React.ComponentType<{
      teamRecurrences: TeamOddsRecurrence[];
      oddsType: "over" | "under";
    }>;
  }
> = ({ data, oddsType, TeamRecurrenceTable }) => {
  const sortedData = [...data].sort(
    (a, b) => b.totalOccurrences - a.totalOccurrences,
  );
  const { hidden, toggle } = useToggleBars();

  const title =
    oddsType === "over"
      ? "Teams That Go Over Most Often"
      : "Teams That Stay Under Most Often";

  const chartDescription =
    oddsType === "over"
      ? "Number of times halftime total went over the odds line (stacked by home/away)"
      : "Number of times halftime total stayed under the odds line (stacked by home/away)";

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
              {chartDescription}.{" "}
              <span className="text-gray-400">Tap legend to show/hide.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer dataLength={sortedData.length}>
              {(w) => (
                <BarChart
                  width={w}
                  height={CHART_HEIGHT}
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
                      position: "insideBottomLeft",
                      style: { fill: "#374151" },
                    }}
                    tick={{ fill: "#374151" }}
                    stroke="#9ca3af"
                  />
                  <Tooltip content={<CustomOddsTooltip />} />
                  <Legend
                    content={orderedLegend(
                      ["homeOccurrences", "awayOccurrences"],
                      hidden,
                      toggle,
                    )}
                  />
                  <Bar
                    dataKey="awayOccurrences"
                    stackId="stack"
                    fill="#ef4444"
                    name="Away Occurrences"
                    radius={[0, 0, 0, 0]}
                    hide={!!hidden["awayOccurrences"]}
                  />
                  <Bar
                    dataKey="homeOccurrences"
                    stackId="stack"
                    fill="#3b82f6"
                    name="Home Occurrences"
                    radius={[4, 4, 0, 0]}
                    hide={!!hidden["homeOccurrences"]}
                  />
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table" className="mt-0">
        <TeamRecurrenceTable teamRecurrences={data} oddsType={oddsType} />
      </TabsContent>
    </Tabs>
  );
};
