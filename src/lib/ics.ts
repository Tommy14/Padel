import { nowUtcStamp, toIcsDate } from "@/lib/format";

type SessionInviteInput = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
};

export function buildSessionIcs({ title, date, startTime, endTime, location, description }: SessionInviteInput) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Padel Planner//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${nowUtcStamp()}`,
    `DTSTART;TZID=Asia/Colombo:${toIcsDate(date, startTime)}`,
    `DTEND;TZID=Asia/Colombo:${toIcsDate(date, endTime)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function escapeIcs(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}
