import { SessionBookingForm } from "@/components/admin/session-booking-form";
import { getCourts, getPlayers } from "@/lib/queries";

export default async function NewSessionPage() {
  const [courts, players] = await Promise.all([getCourts(), getPlayers()]);

  return <SessionBookingForm courts={courts} players={players} />;
}
