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
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
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
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
