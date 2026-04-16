import { PlayersManager } from "@/components/admin/players-manager";
import { getPlayers } from "@/lib/queries";

export default async function AdminPlayersPage() {
  const players = await getPlayers();

  return <PlayersManager players={players} />;
}
