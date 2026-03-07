import { getUpcomingTeamEvents } from "../lib/content";

export const revalidate = 60;

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HomePage() {
  const events = await getUpcomingTeamEvents();

  return (
    <section>
      <p className="kicker">Upcoming Sessions</p>
      <h1>Ride Calendar</h1>
      <p className="lead">
        Join open team sessions and training events. Content syncs from Directus when available.
      </p>

      <div className="event-grid">
        {events.map((event) => (
          <article key={event.id} className="event-card">
            <p className="event-date">{formatDate(event.eventDateIso)}</p>
            <h2>{event.title}</h2>
            <p className="event-description">{event.description}</p>
            <p className="event-location">{event.location}</p>
            <p className="event-source">source: {event.source}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
