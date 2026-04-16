import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, Sparkles, Trophy, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardData();

  return (
    <div className="space-y-5 md:space-y-6">
      <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/20 via-background/55 to-background/35">
        <div className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
          <div className="h-full w-24 bg-primary/60 animate-glow-sweep" />
        </div>
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Padel control center
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm sm:text-base">
            Monitor players, manage credits, and keep every session organized with a clean, real-time admin workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <QuickPulse label="Active players" value={String(stats.playerCount)} />
            <QuickPulse label="This week" value={`${stats.upcomingThisWeek} sessions`} />
            <QuickPulse label="Credit pool" value={formatCurrency(stats.totalCreditsHeld)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Quick actions</CardTitle>
          <CardDescription>Jump into high-impact admin tasks in one tap.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ActionTile
            description="Update details, top-ups, and balance adjustments."
            href="/admin/players"
            icon={<Users className="h-5 w-5 text-primary" />}
            label="Manage players"
          />
          <ActionTile
            description="Add courts and keep venue rates up to date."
            href="/admin/courts"
            icon={<Trophy className="h-5 w-5 text-primary" />}
            label="Manage courts"
          />
          <ActionTile
            description="Create upcoming sessions and split costs instantly."
            href="/admin/sessions/new"
            icon={<CalendarDays className="h-5 w-5 text-primary" />}
            label="Book a session"
          />
          <ActionTile
            description="Review player fees and session history."
            href="/admin/sessions"
            icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
            label="View sessions"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActionTile({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      className="glass-soft group rounded-xl p-4 transition hover:border-primary/45 hover:bg-primary/10"
      href={href}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      </div>
      <div className="mt-3 flex items-center text-sm font-medium text-primary">
        Open
        <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function QuickPulse({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-soft rounded-lg px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
