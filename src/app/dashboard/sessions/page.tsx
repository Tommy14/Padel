import { CalendarDays, Clock3, CircleDollarSign, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getPlayerDashboardData, type PlayerSessionEntry } from "@/lib/queries";
import { requirePlayer } from "@/lib/auth";

export default async function PlayerSessionsPage() {
  const profile = await requirePlayer();
  const data = await getPlayerDashboardData(profile.id);
  const upcomingCount = data.upcoming.length;
  const pastCount = data.past.length;

  return (
    <div className="space-y-5 md:space-y-6">
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/20 via-background/80 to-background/50">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            My sessions
          </CardTitle>
          <CardDescription>Every match in your history, with the full squad for each session.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <Metric icon={<CalendarDays className="h-4 w-4 text-primary" />} label="Total sessions" value={String(data.all.length)} />
          <Metric icon={<Clock3 className="h-4 w-4 text-primary" />} label="Upcoming" value={String(upcomingCount)} />
          <Metric icon={<CircleDollarSign className="h-4 w-4 text-primary" />} label="Played" value={String(pastCount)} />
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-background/70 backdrop-blur">
        <CardContent className="space-y-4 pt-6">
          {data.all.length === 0 ? (
            <div className="glass-soft rounded-xl border-dashed p-6 text-sm text-muted-foreground">
              No sessions yet. Your booked matches will appear here.
            </div>
          ) : null}
          {data.all.map((entry: PlayerSessionEntry) => {
            const players = (entry.session?.session_players ?? [])
              .map((row) => row.player?.name)
              .filter((name): name is string => Boolean(name));

            return (
              <div
                key={entry.id}
                className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-background/70 to-primary/5 p-4 transition hover:border-primary/45 hover:shadow-[0_0_30px_-18px_hsl(var(--primary))]"
              >
                <div className="pointer-events-none absolute -right-10 top-0 h-20 w-20 rounded-full bg-cyan-300/10 blur-xl" />
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                    <p className="font-medium">{entry.session ? formatSessionDate(entry.session.date) : "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Court</p>
                    <p className="font-medium">{entry.session?.court?.name ?? "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Session players</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {players.length > 0 ? (
                        players.map((name) => (
                          <span
                            key={`${entry.id}-${name}`}
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                              name === profile.name
                                ? "border-primary/60 bg-primary/15 text-primary"
                                : "border-primary/25 bg-primary/5 text-foreground"
                            }`}
                          >
                            {name === profile.name ? "You" : name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No players listed</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Fee & time</p>
                    <p className="font-medium">
                      {formatCurrency(Number(entry.fee))}
                      {entry.session ? ` · ${formatTimeRange(entry.session.start_time, entry.session.end_time)}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-soft rounded-xl px-3 py-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
