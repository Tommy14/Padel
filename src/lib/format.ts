import { format, formatISO, parseISO } from "date-fns";

import { APP_CURRENCY } from "@/lib/constants";

export const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: APP_CURRENCY,
  minimumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value ?? 0);
}

export function formatSessionDate(value: string) {
  return format(parseISO(value), "EEE, dd MMM yyyy");
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

export function toIcsDate(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replaceAll(":", "").slice(0, 4)}00`;
}

export function nowUtcStamp() {
  return formatISO(new Date()).replaceAll("-", "").replaceAll(":", "").split(".")[0] + "Z";
}
