"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SessionPreviewTable } from "@/components/sessions/session-preview-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import type { Court, Profile } from "@/lib/types";

type SessionBookingFormProps = {
  courts: Court[];
  players: Profile[];
};

const hourOptions = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

export function SessionBookingForm({ courts, players }: SessionBookingFormProps) {
  const router = useRouter();
  const [courtId, setCourtId] = useState(courts[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourt = courts.find((court) => court.id === courtId);
  const durationHours = useMemo(() => {
    if (!startTime || !endTime) {
      return 0;
    }

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const duration = endHours + endMinutes / 60 - (startHours + startMinutes / 60);
    return duration > 0 ? duration : 0;
  }, [endTime, startTime]);

  const totalCost = (selectedCourt ? Number(selectedCourt.hourly_rate) : 0) * durationHours;
  const feePerPlayer = selectedPlayerIds.length > 0 ? totalCost / selectedPlayerIds.length : 0;

  const previewRows = players
    .filter((player) => selectedPlayerIds.includes(player.id))
    .map((player) => ({
      id: player.id,
      name: player.name,
      fee: feePerPlayer,
      currentCredit: Number(player.credit_balance),
      afterCredit: Number(player.credit_balance) - feePerPlayer,
    }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId,
        date,
        startTime,
        endTime,
        notes,
        playerIds: selectedPlayerIds,
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to create session.");
      return;
    }

    router.push(`/admin/sessions/${payload.sessionId}/confirmation`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Book a session</CardTitle>
          <CardDescription>Choose the court, time, and players. Cost and fees update automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Court</Label>
            <Select onValueChange={setCourtId} value={courtId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name} - {formatCurrency(Number(court.hourly_rate))}/hr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="session-date">Date</Label>
              <Input id="session-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-start-time">Start time</Label>
              <Select onValueChange={setStartTime} value={startTime}>
                <SelectTrigger id="session-start-time">
                  <SelectValue placeholder="Select hour" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-end-time">End time</Label>
              <Select onValueChange={setEndTime} value={endTime}>
                <SelectTrigger id="session-end-time">
                  <SelectValue placeholder="Select hour" />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Players</Label>
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              {players.map((player) => {
                const checked = selectedPlayerIds.includes(player.id);

                return (
                  <label key={player.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                    <input
                      checked={checked}
                      className="h-4 w-4"
                      type="checkbox"
                      onChange={(event) => {
                        setSelectedPlayerIds((current) =>
                          event.target.checked
                            ? [...current, player.id]
                            : current.filter((entry) => entry !== player.id),
                        );
                      }}
                    />
                    <span className="flex-1">
                      <span className="block font-medium">{player.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(Number(player.credit_balance))}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            className="w-full"
            disabled={!courtId || !date || !startTime || !endTime || selectedPlayerIds.length === 0 || loading}
            onClick={handleSubmit}
            type="button"
          >
            {loading ? "Booking..." : "Create booking"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost preview</CardTitle>
          <CardDescription>Review total session cost and the deduction per player.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hourly rate</span>
              <span>{selectedCourt ? formatCurrency(Number(selectedCourt.hourly_rate)) : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>{durationHours.toFixed(0)} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total cost</span>
              <span className="font-medium">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fee per player</span>
              <span className="font-medium">{formatCurrency(feePerPlayer)}</span>
            </div>
          </div>
          <SessionPreviewTable rows={previewRows} />
        </CardContent>
      </Card>
    </div>
  );
}
