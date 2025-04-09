import ClientWrapper from "@/components/appointment/ClientWrapper";
import { API_URL, SOCKET_URL } from "@/config/environment";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function AppointmentPage() {
  return <ClientWrapper />;
}