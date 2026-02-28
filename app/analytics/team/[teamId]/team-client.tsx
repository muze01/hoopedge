"use client";

import { Key, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { ProFeatureBlur } from "@/components/ProFeatureBlur";
import { OddsFilterControls } from "@/components/OddsFilterContols";
import {
  getFeatureAccess,
  GameEntry,
  AggStats,
  TeamData,
} from "@/types/all.types";
import { ArrowLeft, Home, Plane } from "lucide-react";
import { useTeamDetail } from "@/hooks/use-team-detail";
import { ColInfo } from "@/components/ColInfo";

// For scoring: threshold is the pivot. Higher = greener, lower = redder.
function scoringColor(value: number, threshold: number): string {
  const diff = value - threshold;
  if (diff >= 8) return "bg-green-700  border-green-700  text-white";
  if (diff >= 4) return "bg-green-500  border-green-500  text-white";
  if (diff >= 0) return "bg-green-100  border-green-300  text-green-900";
  if (diff >= -4) return "bg-red-100    border-red-300    text-red-800";
  if (diff >= -8) return "bg-red-500    border-red-500    text-white";
  return "bg-red-700     border-red-700     text-white";
}

// For conceding: lower = redder (you give up less, we want to easily identify who gives up more), higher = greener (you give up more, what we want).
function concedingColor(value: number, threshold: number): string {
  const diff = value - threshold;
  if (diff <= -8) return "bg-red-700  border-red-700  text-white";
  if (diff <= -4) return "bg-red-500  border-red-500  text-white";
  if (diff <= 0) return "bg-red-100  border-red-300  text-red-900";
  if (diff <= 4) return "bg-green-100    border-green-300    text-green-800";
  if (diff <= 8) return "bg-green-500    border-green-500    text-white";
  return "bg-green-600     border-green-600 text-white";
}

function pctColor(pct: number): string {
  if (pct >= 75) return "bg-green-700  border-green-700  text-white";
  if (pct >= 60) return "bg-green-500  border-green-500  text-white";
  if (pct >= 50) return "bg-gray-100  border-gray-300  text-gray-700";
  if (pct >= 40) return "bg-red-100    border-red-300    text-red-800";
  return "bg-red-600     border-red-600     text-white";
}

type HiddenSeries = Record<string, boolean>;
function useToggle() {
  const [hidden, setHidden] = useState<HiddenSeries>({});
  const toggle = (key: string) => setHidden((p) => ({ ...p, [key]: !p[key] }));
  return { hidden, toggle };
}

function orderedLegend(
  order: string[],
  hidden?: HiddenSeries,
  toggle?: (k: string) => void,
) {
  return ({ payload }: any) => {
    const sorted = order
      .map((key) => payload?.find((p: any) => p.dataKey === key))
      .filter(Boolean);
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3">
        {sorted.map((entry: any) => (
          <li
            key={entry.dataKey}
            onClick={() => toggle?.(entry.dataKey)}
            className={`flex items-center gap-1.5 text-sm select-none ${toggle ? "cursor-pointer" : ""}`}
            style={{ opacity: hidden?.[entry.dataKey] ? 0.35 : 1 }}
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

const HomeAwayTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const home = payload.find((p: any) => p.dataKey === "Home");
  const away = payload.find((p: any) => p.dataKey === "Away");
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {home && (
        <p className="text-blue-600">
          Home: <strong>{home.value}</strong>
        </p>
      )}
      {away && (
        <p className="text-orange-500">
          Away: <strong>{away.value}</strong>
        </p>
      )}
    </div>
  );
};

const ScoringTrendTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
      <p className="font-semibold mb-1">
        {new Date(d.date).toLocaleDateString("en-GB")}
      </p>
      <p className="text-blue-600">
        HT Scored: <strong>{d.scored}</strong>
      </p>
      <p className="text-red-500">
        HT Conceded: <strong>{d.conceded}</strong>
      </p>
      <p className="text-gray-700">
        HT Total: <strong>{d.total}</strong>
      </p>
    </div>
  );
};

const FingerprintTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const home = payload.find((p: any) => p.dataKey === "Home");
  const away = payload.find((p: any) => p.dataKey === "Away");
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {home && (
        <p className="text-blue-600">
          Home: <strong>{Number(home.value).toFixed(1)}</strong>
        </p>
      )}
      {away && (
        <p className="text-orange-500">
          Away: <strong>{Number(away.value).toFixed(1)}</strong>
        </p>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
}) => (
  <div className={`border rounded-lg p-4 ${colorClass}`}>
    <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
      {label}
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {sub && <div className="text-xs mt-1 opacity-50">{sub}</div>}
  </div>
);

const GameLogTable = ({
  games,
  threshold,
  oddsType,
  isPro,
}: {
  games: GameEntry[];
  threshold: number;
  oddsType: "over" | "under";
  isPro: boolean;
}) => {
  const hitLabel = oddsType === "over" ? "Over" : "Under";
  const missLabel = oddsType === "over" ? "Under" : "Over";

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full bg-white text-sm text-gray-900">
        <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-3 py-2 text-left border-b">Date</th>
            <th className="px-3 py-2 text-left border-b">Opponent</th>
            <th className="px-3 py-2 text-center border-b">Venue</th>
            <th className="px-3 py-2 text-right border-b">
              HT Scored
              <ColInfo text="Team's halftime score" />
            </th>
            <th className="px-3 py-2 text-right border-b">
              HT Con.
              <ColInfo text="Opponent's halftime score" />
            </th>
            <th className="px-3 py-2 text-right border-b">HT Total</th>
            <th className="px-3 py-2 text-center border-b">HT Result</th>
            <th className="px-3 py-2 text-center border-b">
              Over {threshold}
              <ColInfo
                text={`Whether halftime total exceeded the ${threshold}pt threshold`}
              />
            </th>
            {isPro && (
              <>
                <th className="px-3 py-2 text-right border-b">
                  Odds Line
                  <ColInfo text="Qualifying odds line for this game" />
                </th>
                <th className="px-3 py-2 text-center border-b">
                  {hitLabel}/{missLabel}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {games.map((g, idx) => (
            <tr
              key={idx}
              className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                {new Date(g.date).toLocaleDateString("en-GB")}
              </td>
              <td className="px-3 py-2 font-medium">
                <Link
                  href={`/analytics/team/${g.opponentId}`}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  {g.opponent}
                </Link>
              </td>
              <td className="px-3 py-2 text-center">
                {g.location === "home" ? (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                    H
                  </span>
                ) : (
                  <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                    A
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {g.teamHalftime}
              </td>
              <td className="px-3 py-2 text-right text-gray-500">
                {g.oppHalftime}
              </td>
              <td className="px-3 py-2 text-right text-gray-500">
                {g.halftimeTotal}
              </td>
              <td className="px-3 py-2 text-center">
                <span
                  className={`text-xs font-semibold ${
                    g.htResult === "win"
                      ? "text-green-600"
                      : g.htResult === "loss"
                        ? "text-red-600"
                        : "text-gray-400"
                  }`}
                >
                  {g.htResult === "win"
                    ? "W"
                    : g.htResult === "loss"
                      ? "L"
                      : "D"}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                {g.aboveThreshold ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </td>
              {isPro && (
                <>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {g.oddsLine !== null ? (
                      g.oddsLine.toFixed(1)
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {g.oddsLine === null ? (
                      <span className="text-gray-300 text-xs">No odds</span>
                    ) : g.oddsHit ? (
                      <span className="text-green-600 font-semibold">
                        ✓ {hitLabel}
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        ✗ {missLabel}
                      </span>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SummaryRow = ({
  label,
  stats,
  threshold,
  oddsType,
  isPro,
}: {
  label: string;
  stats: AggStats;
  threshold: number;
  oddsType: "over" | "under";
  isPro: boolean;
}) => {
  if (!stats) return null;
  const hitLabel = oddsType === "over" ? "Over" : "Under";
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
        {label}
      </h3>
      <div
        className={`grid grid-cols-2 gap-3 mb-6 ${isPro ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-4"}`}
      >
        <StatCard
          label="Avg HT Scored"
          value={stats.avgHalftimeScored.toFixed(1)}
          sub={`${stats.gamesPlayed} games`}
          colorClass={scoringColor(stats.avgHalftimeScored, threshold)}
        />
        <StatCard
          label="Avg HT Conceded"
          value={stats.avgHalftimeConceded.toFixed(1)}
          colorClass={concedingColor(stats.avgHalftimeConceded, threshold)}
        />
        <StatCard
          label={`Over ${threshold} HT`}
          value={`${stats.overThresholdPct.toFixed(0)}%`}
          sub={`${stats.overThreshold}/${stats.gamesPlayed}`}
          colorClass={pctColor(stats.overThresholdPct)}
        />
        <StatCard
          label="HT Win Rate"
          value={`${stats.htWinPct.toFixed(0)}%`}
          sub={`${stats.htWins}W`}
          colorClass={pctColor(stats.htWinPct)}
        />
        {isPro && (
          <StatCard
            label={`${hitLabel} Odds Hit`}
            value={`${stats.oddsHitPct.toFixed(0)}%`}
            sub={`${stats.oddsHitCount}/${stats.oddsGamesCount} games`}
            colorClass={pctColor(stats.oddsHitPct)}
          />
        )}
      </div>
    </div>
  );
};

const buildRadarData = (home: AggStats, away: AggStats, threshold: number) => {
  if (!home || !away) return [];
  const maxAvg = 80;
  return [
    {
      metric: "HT Scored",
      Home: Math.min((home.avgHalftimeScored / maxAvg) * 100, 100),
      Away: Math.min((away.avgHalftimeScored / maxAvg) * 100, 100),
    },
    {
      metric: `Over ${threshold}%`,
      Home: home.overThresholdPct,
      Away: away.overThresholdPct,
    },
    { metric: "HT Win%", Home: home.htWinPct, Away: away.htWinPct },
    { metric: "Odds Hit%", Home: home.oddsHitPct, Away: away.oddsHitPct },
    {
      metric: "HT Defense",
      Home: Math.max(100 - (home.avgHalftimeConceded / maxAvg) * 100, 0),
      Away: Math.max(100 - (away.avgHalftimeConceded / maxAvg) * 100, 0),
    },
  ];
};

export default function TeamClient({
  data: initialData,
  userRole,
}: {
  data: TeamData;
  userRole: string;
}) {
  const featureAccess = getFeatureAccess(userRole as any);
  const isPro = featureAccess.canAccessOddsAnalysis;

  const [gameLogFilter, setGameLogFilter] = useState<"all" | "home" | "away">(
    "all",
  );

  // Odds filter state
  const [minOdds, setMinOdds] = useState(initialData.minOdds);
  const [maxOdds, setMaxOdds] = useState(initialData.maxOdds);
  const [oddsType, setOddsType] = useState<"over" | "under">(
    initialData.oddsType,
  );

  const { data = initialData, isFetching: oddsLoading } = useTeamDetail(
    initialData.team.id,
    minOdds,
    maxOdds,
    oddsType,
  );

  const { team, threshold } = data;

  const displayedGames =
    gameLogFilter === "home"
      ? data.homeGameLog
      : gameLogFilter === "away"
        ? data.awayGameLog
        : data.allGames;

  const radarData = buildRadarData(data.homeStats, data.awayStats, threshold);
  const formStrip = data.allGames.slice(0, 10).map((g: any) => g.htResult);

  const hitLabel = oddsType === "over" ? "Over" : "Under";
  const missLabel = oddsType === "over" ? "Under" : "Over";

  const { hidden: homeAwayHidden, toggle: homeAwayToggle } = useToggle();
  const { hidden: trendHidden, toggle: trendToggle } = useToggle();
  const { hidden: radarHidden, toggle: radarToggle } = useToggle();

  const oddsBarData = [
    {
      metric: `${hitLabel} Hit %`,
      Home: data.homeStats?.oddsHitPct.toFixed(1) ?? 0,
      Away: data.awayStats?.oddsHitPct.toFixed(1) ?? 0,
    },
    {
      metric: "Games with Odds",
      Home: data.homeStats?.oddsGamesCount ?? 0,
      Away: data.awayStats?.oddsGamesCount ?? 0,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Back link */}
      <Link
        href="/analytics"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analytics
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {team.league.name} · Threshold:{" "}
            <span className="font-semibold text-blue-700">{threshold} pts</span>
          </p>
        </div>

        {/* HT form strip */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-3 mb-2 sm:mt-0">
          <span className="text-xs text-gray-400 mr-0.5 w-full sm:w-auto mb-1 sm:mb-0">
            HT last 10:
          </span>
          {formStrip.map((r: string, i: Key | null | undefined) => (
            <span
              key={i}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shrink-0 ${
                r === "win"
                  ? "bg-green-500"
                  : r === "loss"
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            >
              {r === "win" ? "W" : r === "loss" ? "L" : "D"}
            </span>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <SummaryRow
        label="Overall"
        stats={data.overallStats}
        threshold={threshold}
        oddsType={oddsType}
        isPro={isPro}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-15 mb-15">
        <SummaryRow
          label="Home"
          stats={data.homeStats}
          threshold={threshold}
          oddsType={oddsType}
          isPro={isPro}
        />
        <SummaryRow
          label="Away"
          stats={data.awayStats}
          threshold={threshold}
          oddsType={oddsType}
          isPro={isPro}
        />
      </div>

      {/* PRO: Charts + Odds Section */}
      <ProFeatureBlur
        isBlurred={!isPro}
        featureName="Team Odds & Charts"
        className="mt-10"
      >
        <section className="mt-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Odds & Performance Analysis
            </h2>
            {oddsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                Updating...
              </div>
            )}
          </div>

          {/* Odds filter controls */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full sm:w-fit mb-8">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
              Odds Filters
            </p>
            <OddsFilterControls
              minOdds={minOdds}
              maxOdds={maxOdds}
              oddsType={oddsType}
              onRangeChange={(min, max) => {
                setMinOdds(min);
                setMaxOdds(max);
              }}
              onTypeChange={setOddsType}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 1. Home vs Away Breakdown — first */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-gray-800">
                  Home vs Away Breakdown
                </h3>
                <CardDescription>
                  Avg halftime stats + odds hit rate by venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        metric: "Avg HT Scored",
                        Home: isPro
                          ? (data.homeStats?.avgHalftimeScored.toFixed(1) ?? 0)
                          : 0,
                        Away: isPro
                          ? (data.awayStats?.avgHalftimeScored.toFixed(1) ?? 0)
                          : 0,
                      },
                      {
                        metric: "Avg HT Conceded",
                        Home: isPro
                          ? (data.homeStats?.avgHalftimeConceded.toFixed(1) ??
                            0)
                          : 0,
                        Away: isPro
                          ? (data.awayStats?.avgHalftimeConceded.toFixed(1) ??
                            0)
                          : 0,
                      },
                      {
                        metric: `Over ${threshold}%`,
                        Home: isPro
                          ? (data.homeStats?.overThresholdPct.toFixed(1) ?? 0)
                          : 0,
                        Away: isPro
                          ? (data.awayStats?.overThresholdPct.toFixed(1) ?? 0)
                          : 0,
                      },
                      {
                        metric: `${hitLabel} Odds%`,
                        Home: isPro
                          ? (data.homeStats?.oddsHitPct.toFixed(1) ?? 0)
                          : 0,
                        Away: isPro
                          ? (data.awayStats?.oddsHitPct.toFixed(1) ?? 0)
                          : 0,
                      },
                    ]}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<HomeAwayTooltip />} />
                    <Legend
                      content={orderedLegend(
                        ["Home", "Away"],
                        homeAwayHidden,
                        homeAwayToggle,
                      )}
                    />
                    <Bar
                      dataKey="Home"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      hide={!!homeAwayHidden["Home"]}
                    />
                    <Bar
                      dataKey="Away"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      hide={!!homeAwayHidden["Away"]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Team Fingerprint radar */}
            {radarData.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-gray-800">Team Fingerprint</h3>
                  <CardDescription>
                    Home vs Away profile (metrics normalised 0–100)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="60%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 9 }}
                      />
                      <Radar
                        name="Home"
                        dataKey="Home"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.25}
                        hide={!!radarHidden["Home"]}
                      />
                      <Radar
                        name="Away"
                        dataKey="Away"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.25}
                        hide={!!radarHidden["Away"]}
                      />
                      <Legend
                        content={orderedLegend(
                          ["Home", "Away"],
                          radarHidden,
                          radarToggle,
                        )}
                      />
                      <Tooltip content={<FingerprintTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 3. HT Scoring Trend — scored vs conceded */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <h3 className="font-bold text-gray-800">
                  Halftime Scoring Trend
                </h3>
                <CardDescription>
                  Last 20 games — scored vs conceded at halftime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.trendData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<ScoringTrendTooltip />} />
                    <Legend
                      content={orderedLegend(
                        ["scored", "conceded"],
                        trendHidden,
                        trendToggle,
                      )}
                    />
                    <ReferenceLine
                      y={threshold}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: `${threshold} threshold`,
                        fontSize: 10,
                        fill: "#f59e0b",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="scored"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="HT Scored"
                      hide={!!trendHidden["scored"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="conceded"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="HT Conceded"
                      hide={!!trendHidden["conceded"]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4. HT Total vs Odds Line — clean line chart, colored dots show outcome */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <h3 className="font-bold text-gray-800">
                  HT Total vs Odds Line
                </h3>
                <CardDescription>
                  HT total (purple) against the qualifying odds line (amber
                  dashed) — dot color shows {hitLabel} ✓ green / {missLabel} ✗
                  red
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={data.trendData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
                            <p className="font-semibold mb-1">
                              {new Date(d.date).toLocaleDateString("en-GB")}
                            </p>
                            <p className="text-purple-600">
                              HT Total: <strong>{d.total}</strong>
                            </p>
                            {d.oddsLine != null ? (
                              <p className="text-amber-600">
                                Odds Line:{" "}
                                <strong>{Number(d.oddsLine).toFixed(1)}</strong>
                              </p>
                            ) : (
                              <p className="text-gray-400">
                                No qualifying odds
                              </p>
                            )}
                            {d.oddsLine != null && (
                              <p
                                className={
                                  d.oddsHit
                                    ? "text-green-600 font-semibold"
                                    : "text-red-500 font-semibold"
                                }
                              >
                                {d.oddsHit ? `✓ ${hitLabel}` : `✗ ${missLabel}`}
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    {/* HT Total — custom dot colored by outcome */}
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      name="HT Total"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const fill =
                          payload.oddsLine === null
                            ? "#7c3aed"
                            : payload.oddsHit
                              ? "#22c55e"
                              : "#ef4444";
                        return (
                          <circle
                            key={props.key}
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={fill}
                            stroke="#fff"
                            strokeWidth={1.5}
                          />
                        );
                      }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Odds Line — dashed, no dots */}
                    <Line
                      type="monotone"
                      dataKey="oddsLine"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      name="Odds Line"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      </ProFeatureBlur>

      {/* Game log — all users, odds columns PRO-gated inline */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Game Log</h2>
          <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
            {(["all", "home", "away"] as const).map((f, i) => (
              <button
                key={f}
                onClick={() => setGameLogFilter(f)}
                className={`px-4 py-1.5 font-medium capitalize transition-colors cursor-pointer ${
                  gameLogFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${i > 0 ? "border-l border-gray-300" : ""}`}
              >
                {f === "all" ? (
                  "All"
                ) : f === "home" ? (
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    Home
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Plane className="w-3 h-3" />
                    Away
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <GameLogTable
          games={displayedGames}
          threshold={threshold}
          oddsType={oddsType}
          isPro={isPro}
        />
      </section>
    </div>
  );
}
