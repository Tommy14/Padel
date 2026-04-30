import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BOOKING_URL = "https://padelclub.lk/booking/";

export default function AdminAvailabilityPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Court availability</CardTitle>
            <CardDescription>Live booking grid from padelclub.lk</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <iframe
            src={BOOKING_URL}
            className="h-[78vh] w-full rounded-lg border border-border/40"
            title="Padel Club booking availability"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </CardContent>
      </Card>
    </div>
  );
}
