import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-background/90 px-8 py-6 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
