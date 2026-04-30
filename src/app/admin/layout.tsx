import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/courts", label: "Courts" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/sessions/new", label: "Book session" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <AppShell title="Admin" subtitle="Manage players, courts, credits, and sessions." navItems={navItems}>
      {children}
    </AppShell>
  );
}
