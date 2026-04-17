"use client";

import { useMemo, useState } from "react";

import { buildSessionIcs } from "@/lib/ics";
import { buildWhatsappLink, buildWhatsappMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

type PlayerRow = {
  id: string;
  name: string;
  phone: string | null;
  fee: number;
  creditBalance: number;
};

type SessionConfirmationActionsProps = {
  date: string;
  startTime: string;
  endTime: string;
  courtName: string;
  courtLocation: string;
  players: PlayerRow[];
};

export function SessionConfirmationActions(props: SessionConfirmationActionsProps) {
  const playerNames = props.players.map((player) => player.name);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const playerLinks = useMemo(
    () =>
      props.players.map((player) => {
        const sessionForPlayer = {
          date: props.date,
          startTime: props.startTime,
          endTime: props.endTime,
          courtName: props.courtName,
          courtLocation: props.courtLocation,
          otherPlayerNames: playerNames.filter((name) => name !== player.name),
        };

        return {
          player,
          message: buildWhatsappMessage(
            {
              name: player.name,
              phone: player.phone,
              fee: player.fee,
              creditBalance: player.creditBalance,
            },
            sessionForPlayer,
          ),
          link: buildWhatsappLink(
            {
              name: player.name,
              phone: player.phone,
              fee: player.fee,
              creditBalance: player.creditBalance,
            },
            sessionForPlayer,
          ),
        };
      }),
    [props.courtLocation, props.courtName, props.date, props.endTime, props.players, props.startTime, playerNames],
  );
  const sentCount = Object.values(sentMap).filter(Boolean).length;
  const readyToSendCount = playerLinks.filter(({ link }) => Boolean(link)).length;
  const allSendableMarkedSent = readyToSendCount > 0 && sentCount >= readyToSendCount;
  const playersMissingPhone = playerLinks.filter((entry) => !entry.link).map((entry) => entry.player.name);

  function handleToggleSent(playerId: string) {
    setSentMap((current) => ({
      ...current,
      [playerId]: !current[playerId],
    }));
  }

  function handleToggleExpanded(playerId: string) {
    setExpandedMap((current) => ({
      ...current,
      [playerId]: !current[playerId],
    }));
  }

  function handleDownloadIcs() {
    const ics = buildSessionIcs({
      title: `Padel session - ${props.courtName}`,
      date: props.date,
      startTime: props.startTime,
      endTime: props.endTime,
      location: `${props.courtName}, ${props.courtLocation}`,
      description: props.players.map((player) => `${player.name}: LKR ${player.fee.toFixed(2)}`).join("\n"),
    });

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `padel-session-${props.date}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownloadIcs} type="button" variant="outline">
          Send calendar invite
        </Button>
      </div>
      {playersMissingPhone.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          No WhatsApp number for: {playersMissingPhone.join(", ")}.
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Sent checklist: {sentCount}/{readyToSendCount} players marked sent.
        {allSendableMarkedSent ? " All sendable players are marked as sent." : ""}
      </p>
      <div className="space-y-3">
        {playerLinks.map(({ player, link, message }) => (
          <div className="space-y-2 rounded-md border p-3" key={player.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{player.name}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    checked={Boolean(sentMap[player.id])}
                    onChange={() => handleToggleSent(player.id)}
                    type="checkbox"
                  />
                  Mark sent
                </label>
                <Button onClick={() => handleToggleExpanded(player.id)} type="button" variant="outline">
                  {expandedMap[player.id] ? "Minimize" : "Expand"}
                </Button>
              </div>
            </div>
            {expandedMap[player.id] ? (
              <>
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{message}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(message)}
                    type="button"
                    variant="outline"
                  >
                    Copy {player.name} message
                  </Button>
                  <Button asChild disabled={!link} type="button">
                    <a href={link ?? "#"} rel="noreferrer" target="_blank">
                      Open chat
                    </a>
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
