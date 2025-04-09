import DoctorSignupForm from "@/components/auth/DoctorSignupForm";
import { API_URL, SOCKET_URL } from "@/config/environment";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata = {
  title: "MediBot - Doctor Registration",
  description: "Join our network of healthcare professionals",
};

export default function DoctorSignupPage() {
  return <DoctorSignupForm />;
}
