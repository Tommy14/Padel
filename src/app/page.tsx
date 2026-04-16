import Link from "next/link";
import { CalendarDays, CircleDollarSign, Users } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Padel Planner</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Plan sessions faster and keep every player updated.
          </h1>
          <p className="text-lg text-muted-foreground">
            A professional platform for padel groups to manage bookings, track credit balances, and keep schedules clear for both admins and players.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {profile ? (
              <Button asChild size="lg">
                <Link href={profile.role === "admin" ? "/admin" : "/dashboard"}>Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<CalendarDays className="h-5 w-5 text-primary" />}
            title="Session scheduling"
            text="Book courts, assign players, and share session details with accurate dates and times."
          />
          <InfoCard
            icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
            title="Credit management"
            text="Track player balances, split costs fairly, and maintain a reliable transaction history."
          />
          <InfoCard
            icon={<Users className="h-5 w-5 text-primary" />}
            title="Player visibility"
            text="Players can view upcoming and past sessions while staying aware of their remaining credit."
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="border-primary/15 bg-background/90">
      <CardContent className="space-y-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
