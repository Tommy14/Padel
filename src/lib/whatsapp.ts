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
  const firstName = player.name.trim().split(/\s+/)[0] ?? player.name;
  const otherFirstNames = session.otherPlayerNames
    .map((name) => name.trim().split(/\s+/)[0] ?? name)
    .filter(Boolean);
  const others = otherFirstNames.length > 0 ? otherFirstNames.join(", ") : "No other players listed";
  const EMOJI_TENNIS = String.fromCodePoint(0x1f3be);
  const EMOJI_CALENDAR = String.fromCodePoint(0x1f4c5);
  const EMOJI_CLOCK = String.fromCodePoint(0x23f0);
  const EMOJI_STADIUM = String.fromCodePoint(0x1f3df);
  const EMOJI_PEOPLE = String.fromCodePoint(0x1f465);
  const EMOJI_CARD = String.fromCodePoint(0x1f4b3);
  const EMOJI_MONEY_BAG = String.fromCodePoint(0x1f4b0);

  return [
    `Hi ${firstName}! ${EMOJI_TENNIS} You have a padel session booked.`,
    `${EMOJI_CALENDAR} Date: ${session.date}`,
    `${EMOJI_CLOCK} Time: ${session.startTime} - ${session.endTime}`,
    `${EMOJI_STADIUM} Venue: ${session.courtName}, ${session.courtLocation}`,
    `${EMOJI_PEOPLE} Others: ${others}`,
    `${EMOJI_CARD} Your fee: ${APP_CURRENCY} ${player.fee.toFixed(2)} (deducted from your credit)`,
    `${EMOJI_MONEY_BAG} Remaining credit: ${player.creditBalance.toFixed(2)}`,
    "See you on the court!",
  ].join("\n");
}

export function buildWhatsappLink(player: WhatsappPlayer, session: WhatsappSession) {
  if (!player.phone) {
    return null;
  }

  const message = buildWhatsappMessage(player, session);

  return `https://wa.me/${player.phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;
}
