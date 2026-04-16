import { CalendarDays, Clock3, CircleDollarSign, Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditBadge } from "@/components/ui/credit-badge";
import { formatCurrency, formatSessionDate, formatTimeRange } from "@/lib/format";
import { getPlayerDashboardData, type PlayerSessionEntry } from "@/lib/queries";
import { requirePlayer } from "@/lib/auth";

export default async function PlayerDashboardPage() {
  const profile = await requirePlayer();
  const data = await getPlayerDashboardData(profile.id);
  const balance = Number(profile.credit_balance);

  return (
    <div className="space-y-5 md:space-y-6">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
          <div className="h-full w-24 bg-primary/60 animate-glow-sweep" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome back, {profile.name}
          </CardTitle>
          <CardDescription>Track your credit and stay ready for your next padel match.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Current credit</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">{formatCurrency(balance)}</p>
            </div>
            <div className="animate-float-soft">
              <CreditBadge amount={balance} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <StatChip icon={<CalendarDays className="h-4 w-4 text-primary" />} label="Upcoming" value={String(data.upcoming.length)} />
            <StatChip icon={<Clock3 className="h-4 w-4 text-primary" />} label="Played" value={String(data.past.length)} />
            <StatChip icon={<CircleDollarSign className="h-4 w-4 text-primary" />} label="Last fee" value={data.all[0] ? formatCurrency(Number(data.all[0].fee)) : "-"} />
          </div>
        </CardContent>
      </Card>

      <SessionSection emptyText="No upcoming sessions yet. Once your admin books one, it will appear here." title="Upcoming sessions" items={data.upcoming} />
      <SessionSection emptyText="No past sessions recorded yet." title="Past sessions" items={data.past} />
    </div>
  );
}

function SessionSection({ title, items, emptyText }: { title: string; items: PlayerSessionEntry[]; emptyText: string }) {
  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">{emptyText}</div>
        ) : null}
        {items.map((entry) => (
          <div key={entry.id} className="rounded-xl border bg-background p-4 transition hover:border-primary/40 hover:shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4 text-primary" />
                  {entry.session?.court?.name ?? "Court unavailable"}
                </p>
                {entry.session ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formatSessionDate(entry.session.date)} · {formatTimeRange(entry.session.start_time, entry.session.end_time)}
                  </p>
                ) : null}
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
                Fee {formatCurrency(Number(entry.fee))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/80 px-3 py-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
