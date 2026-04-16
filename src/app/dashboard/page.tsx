import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditBadge } from "@/components/ui/credit-badge";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getPlayerDashboardData, type PlayerSessionEntry } from "@/lib/queries";
import { requirePlayer } from "@/lib/auth";

export default async function PlayerDashboardPage() {
  const profile = await requirePlayer();
  const data = await getPlayerDashboardData(profile.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit balance</CardTitle>
          <CardDescription>Your current available balance.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-4xl font-semibold">{formatCurrency(Number(profile.credit_balance))}</div>
          <CreditBadge amount={Number(profile.credit_balance)} />
        </CardContent>
      </Card>

      <SessionSection title="Upcoming sessions" items={data.upcoming} />
      <SessionSection title="Past sessions" items={data.past} />
    </div>
  );
}

function SessionSection({ title, items }: { title: string; items: PlayerSessionEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No sessions found.</p> : null}
        {items.map((entry) => (
          <div key={entry.id} className="rounded-lg border p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{entry.session?.court?.name ?? "Court unavailable"}</p>
                {entry.session ? (
                  <p className="text-sm text-muted-foreground">
                    {formatSessionDate(entry.session.date)} · {formatTimeRange(entry.session.start_time, entry.session.end_time)}
                  </p>
                ) : null}
              </div>
              <div className="text-sm font-medium">{formatCurrency(Number(entry.fee))}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
