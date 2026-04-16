import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <AuthForm mode="login" />
    </div>
  );
}
