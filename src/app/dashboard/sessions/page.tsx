import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getPlayerDashboardData, type PlayerSessionEntry } from "@/lib/queries";
import { requirePlayer } from "@/lib/auth";

export default async function PlayerSessionsPage() {
  const profile = await requirePlayer();
  const data = await getPlayerDashboardData(profile.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My sessions</CardTitle>
        <CardDescription>All sessions where you were included.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.all.map((entry: PlayerSessionEntry) => {
          const otherPlayers = (entry.session?.session_players ?? [])
            .map((row) => row.player?.name)
            .filter((name): name is string => Boolean(name && name !== profile.name));

          return (
            <div key={entry.id} className="rounded-lg border p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{entry.session ? formatSessionDate(entry.session.date) : "Unavailable"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium">{entry.session?.court?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Other players</p>
                  <p className="font-medium">{otherPlayers.join(", ") || "No other players"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee</p>
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
  );
}
