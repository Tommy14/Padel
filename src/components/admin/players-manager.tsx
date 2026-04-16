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
import { CreditBadge } from "@/components/ui/credit-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Profile } from "@/lib/types";

type PlayersManagerProps = {
  players: Profile[];
};

export function PlayersManager({ players }: PlayersManagerProps) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addCredit(playerId: string, formData: FormData) {
    setBusyKey(`credit-${playerId}`);
    setError(null);

    const response = await fetch("/api/admin/players/credit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        amount: Number(formData.get("amount")),
        description: String(formData.get("description") || "Credit top-up"),
      }),
    });

    const payload = await response.json();
    setBusyKey(null);

    if (!response.ok) {
      setError(payload.error ?? "Failed to add credit.");
      return;
    }

    router.refresh();
  }

  async function editPlayer(playerId: string, formData: FormData) {
    setBusyKey(`edit-${playerId}`);
    setError(null);

    const response = await fetch(`/api/admin/players/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
      }),
    });

    const payload = await response.json();
    setBusyKey(null);

    if (!response.ok) {
      setError(payload.error ?? "Failed to update player.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player accounts</CardTitle>
          <CardDescription>
            Players create their own accounts through signup. Admins can update their details and manage credit balances here.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>All signed-up players and their current credit balances.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Credit balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.phone || "Not provided"}</TableCell>
                  <TableCell>
                    <CreditBadge amount={Number(player.credit_balance)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit player</DialogTitle>
                            <DialogDescription>Update the player profile details.</DialogDescription>
                          </DialogHeader>
                          <form
                            className="space-y-4"
                            action={async (formData) => {
                              await editPlayer(player.id, formData);
                            }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor={`name-${player.id}`}>Name</Label>
                              <Input defaultValue={player.name} id={`name-${player.id}`} name="name" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`phone-${player.id}`}>Phone</Label>
                              <Input
                                defaultValue={player.phone ?? ""}
                                id={`phone-${player.id}`}
                                name="phone"
                                placeholder="+94771234567"
                                required
                              />
                            </div>
                            <DialogFooter>
                              <Button disabled={busyKey === `edit-${player.id}`} type="submit">
                                {busyKey === `edit-${player.id}` ? "Saving..." : "Save changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Add credit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add credit</DialogTitle>
                            <DialogDescription>Add a top-up transaction for {player.name}.</DialogDescription>
                          </DialogHeader>
                          <form
                            className="space-y-4"
                            action={async (formData) => {
                              await addCredit(player.id, formData);
                            }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor={`amount-${player.id}`}>Amount</Label>
                              <Input id={`amount-${player.id}`} min="0.01" name="amount" required step="0.01" type="number" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`description-${player.id}`}>Description</Label>
                              <Input
                                defaultValue="Credit top-up"
                                id={`description-${player.id}`}
                                name="description"
                                required
                              />
                            </div>
                            <DialogFooter>
                              <Button disabled={busyKey === `credit-${player.id}`} type="submit">
                                {busyKey === `credit-${player.id}` ? "Adding..." : "Add credit"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
