import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getSessions, type SessionWithRelations } from "@/lib/queries";

export default async function AdminSessionsPage() {
  const sessions = await getSessions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All sessions</CardTitle>
        <CardDescription>Past and upcoming sessions sorted by latest date first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session: SessionWithRelations) => (
          <details key={session.id} className="rounded-lg border bg-background p-4">
            <summary className="cursor-pointer list-none">
              <div className="grid gap-2 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatSessionDate(session.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Court</p>
                  <p className="font-medium">{session.court?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-medium">
                    {(session.session_players ?? []).map((row) => row.player?.name).filter(Boolean).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total cost</p>
                  <p className="font-medium">
                    {formatCurrency(Number(session.total_cost))} · {formatTimeRange(session.start_time, session.end_time)}
                  </p>
                </div>
              </div>
            </summary>
            <div className="mt-4 space-y-2 border-t pt-4">
              {(session.session_players ?? []).map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                  <span>{row.player?.name}</span>
                  <span>{formatCurrency(Number(row.fee))}</span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
