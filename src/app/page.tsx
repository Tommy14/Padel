import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <div className="container flex min-h-screen items-center py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary">Padel Planner</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Organise padel sessions, credit balances, and player notifications in one place.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Built for admins to schedule sessions, split court costs, deduct credits, and share WhatsApp and calendar details with players.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile ? (
              <Button asChild size="lg">
                <Link href={profile.role === "admin" ? "/admin" : "/dashboard"}>Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup">Create an account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>What’s included</CardTitle>
            <CardDescription>Everything needed for admin and player flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Admin dashboard with players, courts, sessions, and booking tools.</p>
            <p>Player dashboard with upcoming and past sessions plus live credit balance.</p>
            <p>Session confirmation with WhatsApp deep links and `.ics` calendar download.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
