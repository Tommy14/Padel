"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import type { Court, Profile } from "@/lib/types";

type SessionRowActionsProps = {
  sessionId: string;
  initialCourtId: string;
  initialDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialNotes: string;
  initialPlayerIds: string[];
  courts: Court[];
  players: Profile[];
};

export function SessionRowActions(props: SessionRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courtId, setCourtId] = useState(props.initialCourtId);
  const [date, setDate] = useState(props.initialDate);
  const [startTime, setStartTime] = useState(props.initialStartTime.slice(0, 5));
  const [endTime, setEndTime] = useState(props.initialEndTime.slice(0, 5));
  const [notes, setNotes] = useState(props.initialNotes);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(props.initialPlayerIds);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourt = props.courts.find((court) => court.id === courtId);
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

  async function handleSave() {
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/sessions/${props.sessionId}`, {
      method: "PATCH",
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
    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to update session.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this booked session? Player credits will be refunded.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    const response = await fetch(`/api/admin/sessions/${props.sessionId}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    setDeleting(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to delete session.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit booked session</DialogTitle>
            <DialogDescription>Update details, players, and fees. Credits will be adjusted automatically.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Court</Label>
              <Select onValueChange={setCourtId} value={courtId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  {props.courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} - {formatCurrency(Number(court.hourly_rate))}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`date-${props.sessionId}`}>Date</Label>
                <Input id={`date-${props.sessionId}`} onChange={(event) => setDate(event.target.value)} type="date" value={date} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`start-${props.sessionId}`}>Start time</Label>
                <Input
                  id={`start-${props.sessionId}`}
                  onChange={(event) => setStartTime(event.target.value)}
                  type="time"
                  value={startTime}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-${props.sessionId}`}>End time</Label>
                <Input id={`end-${props.sessionId}`} onChange={(event) => setEndTime(event.target.value)} type="time" value={endTime} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Players</Label>
              <div className="grid max-h-56 gap-2 overflow-auto rounded-lg border p-3 sm:grid-cols-2">
                {props.players.map((player) => {
                  const checked = selectedPlayerIds.includes(player.id);
                  return (
                    <label className="flex items-center gap-2 rounded border p-2 text-sm" key={player.id}>
                      <input
                        checked={checked}
                        className="h-4 w-4"
                        onChange={(event) => {
                          setSelectedPlayerIds((current) =>
                            event.target.checked ? [...current, player.id] : current.filter((entry) => entry !== player.id),
                          );
                        }}
                        type="checkbox"
                      />
                      <span className="flex-1">{player.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Estimated per-player fee: {formatCurrency(feePerPlayer)} ({selectedPlayerIds.length} players selected)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${props.sessionId}`}>Notes</Label>
              <Textarea id={`notes-${props.sessionId}`} onChange={(event) => setNotes(event.target.value)} value={notes} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button disabled={!courtId || !date || !startTime || !endTime || selectedPlayerIds.length === 0 || saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button disabled={deleting} onClick={handleDelete} type="button" variant="destructive">
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
