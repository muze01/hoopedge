import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

async function fetchTeamDetail(
  teamId: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
) {
  const params = new URLSearchParams({
    minOdds: minOdds.toString(),
    maxOdds: maxOdds.toString(),
    oddsType,
  });
  const res = await fetch(`/api/analytics/team/${teamId}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch team detail");
  const result = await res.json();
  if (!result.success) throw new Error(result.error ?? "Team detail error");
  return result.data;
}

export function useTeamDetail(
  teamId: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
) {
  return useQuery({
    queryKey: queryKeys.teamDetail(teamId, minOdds, maxOdds, oddsType),
    queryFn: () => fetchTeamDetail(teamId, minOdds, maxOdds, oddsType),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000,
  });
}
