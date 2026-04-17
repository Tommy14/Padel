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
  otherPlayerNames: string[];
};

export function buildWhatsappMessage(player: WhatsappPlayer, session: WhatsappSession) {
  const others = session.otherPlayerNames.length > 0 ? session.otherPlayerNames.join(", ") : "No other players listed";

  return `Hi ${player.name}! 🎾 You have a padel session booked.
📅 Date: ${session.date}
⏰ Time: ${session.startTime} - ${session.endTime}
🏟️ Venue: ${session.courtName}, ${session.courtLocation}
👥 Others: ${others}
💳 Your fee: ${APP_CURRENCY} ${player.fee.toFixed(2)} (deducted from your credit)
💰 Remaining credit: ${player.creditBalance.toFixed(2)}
See you on the court!`;
}

export function buildWhatsappLink(player: WhatsappPlayer, session: WhatsappSession) {
  if (!player.phone) {
    return null;
  }

  const message = buildWhatsappMessage(player, session);

  return `https://wa.me/${player.phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}
