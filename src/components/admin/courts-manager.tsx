"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { Court } from "@/lib/types";

type CourtsManagerProps = {
  courts: Court[];
};

export function CourtsManager({ courts }: CourtsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false);

  async function handleCreateCourt(formData: FormData) {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/courts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") || ""),
        location: String(formData.get("location") || ""),
        hourlyRate: Number(formData.get("hourlyRate") || 0),
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to add court.");
      return;
    }

    setIsAddCourtOpen(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Courts</CardTitle>
          <CardDescription>Manage court venues and hourly pricing.</CardDescription>
        </div>
        <Dialog onOpenChange={setIsAddCourtOpen} open={isAddCourtOpen}>
          <DialogTrigger asChild>
            <Button>Add court</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add court</DialogTitle>
              <DialogDescription>Create a new bookable court for sessions.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              action={async (formData) => {
                await handleCreateCourt(formData);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="court-name">Name</Label>
                <Input id="court-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="court-location">Location</Label>
                <Input id="court-location" name="location" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="court-hourly-rate">Hourly rate</Label>
                <Input id="court-hourly-rate" min="0" name="hourlyRate" required step="0.01" type="number" />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button disabled={loading} type="submit">
                  {loading ? "Saving..." : "Save court"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Hourly rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id}>
                <TableCell className="font-medium">{court.name}</TableCell>
                <TableCell>{court.location}</TableCell>
                <TableCell>{formatCurrency(Number(court.hourly_rate))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
