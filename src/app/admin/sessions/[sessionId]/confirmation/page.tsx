import Link from "next/link";

import { SessionConfirmationActions } from "@/components/admin/session-confirmation-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getSessionById, type SessionWithRelations } from "@/lib/queries";

export default async function SessionConfirmationPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session: SessionWithRelations = await getSessionById(params.sessionId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking confirmed</CardTitle>
          <CardDescription>The session has been saved and player credits were deducted.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatSessionDate(session.date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{formatTimeRange(session.start_time, session.end_time)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Court</p>
            <p className="font-medium">
              {session.court?.name}, {session.court?.location}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total cost</p>
            <p className="font-medium">{formatCurrency(Number(session.total_cost))}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>Review the deducted amount for each player.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(session.session_players ?? []).map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-md border px-4 py-3 text-sm">
              <span>{row.player?.name}</span>
              <span>
                {formatCurrency(Number(row.fee))} · Remaining credit {formatCurrency(Number(row.player?.credit_balance ?? 0))}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>Open WhatsApp links manually or download a calendar invite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <Button asChild variant="outline">
            <Link href="/admin/sessions">Back to sessions</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
