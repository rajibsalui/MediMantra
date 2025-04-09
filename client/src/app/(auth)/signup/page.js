import UserSignupForm from "@/components/auth/UserSignupForm";
import { API_URL, SOCKET_URL } from "@/config/environment";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata = {
  title: "MediBot - Patient Registration",
  description: "Create your patient account to access healthcare services",
};

export default function UserSignupPage() {
  return <UserSignupForm />;
}
