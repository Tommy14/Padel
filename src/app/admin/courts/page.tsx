import { CourtsManager } from "@/components/admin/courts-manager";
import { getCourts } from "@/lib/queries";

export default async function AdminCourtsPage() {
  const courts = await getCourts();

  return <CourtsManager courts={courts} />;
}
