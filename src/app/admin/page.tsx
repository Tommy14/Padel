import Link from "next/link";
import { CalendarDays, CreditCard, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/queries";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total players" value={String(stats.playerCount)} />
        <StatCard icon={CalendarDays} label="Upcoming this week" value={String(stats.upcomingThisWeek)} />
        <StatCard icon={CreditCard} label="Total credits held" value={formatCurrency(stats.totalCreditsHeld)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Jump straight into the most common admin tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/players">Manage players</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/courts">Manage courts</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/sessions/new">Book a session</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/sessions">View sessions</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
