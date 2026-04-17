"use client";

import { buildSessionIcs } from "@/lib/ics";
import { buildWhatsappLink } from "@/lib/whatsapp";
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
  const session = {
    date: props.date,
    startTime: props.startTime,
    endTime: props.endTime,
    courtName: props.courtName,
    courtLocation: props.courtLocation,
    playerNames,
  };
  const playerLinks = props.players.map((player) => ({
    player,
    link: buildWhatsappLink(
      {
        name: player.name,
        phone: player.phone,
        fee: player.fee,
        creditBalance: player.creditBalance,
      },
      session,
    ),
  }));
  const sendableLinks = playerLinks.flatMap((entry) => (entry.link ? [entry.link] : []));
  const playersMissingPhone = playerLinks.filter((entry) => !entry.link).map((entry) => entry.player.name);

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

  async function handleSendWhatsappAndCalendar() {
    handleDownloadIcs();

    for (const [index, link] of sendableLinks.entries()) {
      if (index > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
      }

      window.open(link, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownloadIcs} type="button" variant="outline">
          Send calendar invite
        </Button>
        <Button disabled={sendableLinks.length === 0} onClick={handleSendWhatsappAndCalendar} type="button">
          Send WhatsApp + Calendar
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        WhatsApp links open in new tabs. The invite downloads first, then chats open one by one. Attach the file manually
        in WhatsApp if needed.
      </p>
      {playersMissingPhone.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          No WhatsApp number for: {playersMissingPhone.join(", ")}.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {playerLinks.map(({ player, link }) => {

          return (
            <Button asChild disabled={!link} key={player.id} type="button">
              <a href={link ?? "#"} rel="noreferrer" target="_blank">
                Notify {player.name} via WhatsApp
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
