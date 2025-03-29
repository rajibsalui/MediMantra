import UserSignupForm from "@/components/auth/UserSignupForm";

export const metadata = {
  title: "MediBot - Patient Registration",
  description: "Create your patient account to access healthcare services",
};

export default function UserSignupPage() {
  return <UserSignupForm />;
}
