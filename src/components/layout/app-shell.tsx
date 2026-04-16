import Link from "next/link";
import { LogOut } from "lucide-react";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { APP_NAME } from "@/lib/constants";
import { signOutAction } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { BackgroundVideo } from "@/components/layout/background-video";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, navItems, children }: AppShellProps) {
  const videoPath = join(process.cwd(), "public", "videos", "padel-playing.mp4");
  const hasBackgroundVideo = existsSync(videoPath);

  return (
    <div className="relative min-h-screen overflow-hidden bg-muted/40">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-background">
        {hasBackgroundVideo ? (
          <BackgroundVideo src="/videos/padel-playing.mp4" />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_hsl(var(--background)/0.58),_hsl(var(--background)/0.8))]" />
      </div>
      <header className="relative z-10 border-b bg-background/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-lg font-semibold text-primary">
              {APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="relative z-10 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
