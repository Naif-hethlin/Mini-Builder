// Route: /login
//
// Combined login + signup card with template chooser. Cookies-only
// session, no email, no password reset.

import { Suspense } from "react";
import { LoginForm } from "./_front/LoginForm";

export const metadata = {
  title: "تسجيل الدخول — ركاز",
};

// LoginForm reads useSearchParams (?next=…), so this route renders
// dynamically rather than prerendering at build time.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
