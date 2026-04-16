import { APP_CURRENCY } from "@/lib/constants";

type WhatsappPlayer = {
  name: string;
  phone: string | null;
  fee: number;
  creditBalance: number;
};

type WhatsappSession = {
  date: string;
  startTime: string;
  endTime: string;
  courtName: string;
  courtLocation: string;
  playerNames: string[];
};

export function buildWhatsappLink(player: WhatsappPlayer, session: WhatsappSession) {
  if (!player.phone) {
    return null;
  }

  const message = `Hi ${player.name}! 🎾 You have a padel session booked.
📅 Date: ${session.date}
⏰ Time: ${session.startTime} – ${session.endTime}
🏟️ Court: ${session.courtName}, ${session.courtLocation}
👥 Players: ${session.playerNames.join(", ")}
💳 Your fee: ${APP_CURRENCY} ${player.fee.toFixed(2)} (deducted from your credit)
💰 Remaining credit: ${player.creditBalance.toFixed(2)}
See you on the court!`;

  return `https://wa.me/${player.phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}
