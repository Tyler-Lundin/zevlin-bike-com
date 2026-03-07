import { directusClient } from "@zevlin/integrations";

export type TeamEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDateIso: string;
  source: "directus" | "fallback";
};

type DirectusTeamEvent = {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  event_date?: string;
};

const fallbackEvents: TeamEvent[] = [
  {
    id: "fallback-criterium-clinic",
    title: "Criterium Skills Clinic",
    description: "High-cadence cornering drills and attack pacing with team coaches.",
    location: "Columbus Velodrome",
    eventDateIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    source: "fallback",
  },
  {
    id: "fallback-gravel-endurance",
    title: "Gravel Endurance Session",
    description: "Group distance build with hydration and pacing checkpoints.",
    location: "Scioto Trail Loop",
    eventDateIso: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    source: "fallback",
  },
];

function normalizeEvent(row: DirectusTeamEvent): TeamEvent | null {
  if (!row.id || !row.title || !row.description || !row.event_date) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location ?? "TBD",
    eventDateIso: row.event_date,
    source: "directus",
  };
}

export async function getUpcomingTeamEvents(): Promise<TeamEvent[]> {
  try {
    const rows = await directusClient.listItems<DirectusTeamEvent>("team_events", {
      fields: ["id", "title", "description", "location", "event_date"],
      filter: {
        event_date: {
          _gte: new Date().toISOString(),
        },
      },
      sort: ["event_date"],
      limit: 6,
    });

    const normalized = rows
      .map(normalizeEvent)
      .filter((event): event is TeamEvent => event !== null);

    if (normalized.length > 0) {
      return normalized;
    }

    return fallbackEvents;
  } catch {
    return fallbackEvents;
  }
}
