import Link from "next/link";
import { LogOut } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { signOutAction } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="relative min-h-screen overflow-hidden bg-muted/40">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_hsl(var(--background)/0.78),_hsl(var(--background)/0.92))]" />
        <div className="padel-court-grid absolute left-1/2 top-20 h-[580px] w-[min(94vw,1200px)] -translate-x-1/2 rounded-[2rem] border border-primary/20 bg-primary/[0.04]" />
        <div className="padel-player-run absolute left-[8%] top-[48%] h-3 w-3 rounded-full bg-primary/50 blur-[1px]" />
        <div className="padel-player-run-alt absolute right-[8%] top-[60%] h-3 w-3 rounded-full bg-primary/40 blur-[1px]" />
        <div className="padel-ball-bounce absolute left-[18%] top-[26%] h-2.5 w-2.5 rounded-full bg-warning/80 shadow-[0_0_14px_hsl(var(--warning)/0.7)]" />
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
