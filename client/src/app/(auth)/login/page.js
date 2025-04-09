import LoginForm from "@/components/auth/LoginForm";
import { API_URL, SOCKET_URL } from "@/config/environment";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata = {
  title: "MediBot - Login",
  description: "Login to your MediBot account",
};

export default function LoginPage() {
  return <LoginForm />;
}
