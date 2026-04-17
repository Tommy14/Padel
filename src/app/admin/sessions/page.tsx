import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionConfirmationActions } from "@/components/admin/session-confirmation-actions";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { SessionRowActions } from "@/components/admin/session-row-actions";
import { getCourts, getPlayers, getSessions, type SessionWithRelations } from "@/lib/queries";

export default async function AdminSessionsPage() {
  const [sessions, courts, players] = await Promise.all([getSessions(), getCourts(), getPlayers()]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All sessions</CardTitle>
        <CardDescription>Past and upcoming sessions sorted by latest date first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session: SessionWithRelations) => (
          <details
            key={session.id}
            className="group overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm"
          >
            <summary className="cursor-pointer list-none">
              <div className="grid gap-3 p-4 md:grid-cols-4">
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatSessionDate(session.date)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Time</p>
                  <p className="font-semibold">{formatTimeRange(session.start_time, session.end_time)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Court</p>
                  <p className="font-semibold">{session.court?.name}</p>
                  <p className="text-xs text-muted-foreground">{session.court?.location}</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total cost</p>
                  <p className="font-semibold">{formatCurrency(Number(session.total_cost))}</p>
                  <p className="text-xs text-muted-foreground">{(session.session_players ?? []).length} players</p>
                </div>
              </div>
            </summary>
            <div className="grid gap-4 border-t border-primary/15 p-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Players and fee breakdown</p>
                <div className="space-y-2 rounded-xl border border-border/60 bg-background/70 p-3">
                  {(session.session_players ?? []).map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm">
                      <span className="font-medium">{row.player?.name}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                        {formatCurrency(Number(row.fee))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-sm font-medium text-muted-foreground">Send notifications any time</p>
                  <div className="pt-3">
                    <SessionConfirmationActions
                      courtLocation={session.court?.location ?? ""}
                      courtName={session.court?.name ?? ""}
                      date={session.date}
                      endTime={session.end_time}
                      players={(session.session_players ?? []).flatMap((row) =>
                        row.player
                          ? [{
                              id: row.player.id,
                              name: row.player.name,
                              phone: row.player.phone,
                              fee: Number(row.fee),
                              creditBalance: Number(row.player.credit_balance ?? 0),
                            }]
                          : [],
                      )}
                      startTime={session.start_time}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Manage booking</p>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-sm text-muted-foreground">
                    Update court, date, time, players, and notes. Deleting refunds player credits automatically.
                  </p>
                  <div className="pt-3">
                    <SessionRowActions
                      courts={courts}
                      initialCourtId={session.court?.id ?? ""}
                      initialDate={session.date}
                      initialEndTime={session.end_time}
                      initialNotes={session.notes ?? ""}
                      initialPlayerIds={(session.session_players ?? []).flatMap((row) => (row.player?.id ? [row.player.id] : []))}
                      initialStartTime={session.start_time}
                      players={players}
                      sessionId={session.id}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4 text-xs text-muted-foreground">
              Tip: click the session row to collapse/expand details.
            </div>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
