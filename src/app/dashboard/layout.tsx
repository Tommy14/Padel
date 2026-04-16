import { AppShell } from "@/components/layout/app-shell";
import { requirePlayer } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/sessions", label: "My sessions" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requirePlayer();

  return (
    <AppShell title="Player dashboard" subtitle="View your credits and session history." navItems={navItems}>
      {children}
    </AppShell>
  );
}
