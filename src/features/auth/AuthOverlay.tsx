"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import { refreshCurrentUser, useCurrentUser } from "./useCurrentUser";

const SKIP_KEY = "rekaz-builder/auth/skipped";

type Mode = "login" | "signup";

/**
 * Full-screen auth gate. Sits on top of any page (typically /templates).
 * If the user isn't signed in AND hasn't explicitly "browsed without
 * login" this session, the overlay covers the page. After signup / login
 * / skip → overlay fades.
 *
 * Skip persists in sessionStorage so it doesn't keep nagging across
 * route changes in the same tab.
 */
export function AuthOverlay() {
  const { user, loading } = useCurrentUser();
  const [skipped, setSkipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSkipped(window.sessionStorage.getItem(SKIP_KEY) === "1");
    }
    setHydrated(true);
  }, []);

  const show = hydrated && !loading && !user && !skipped;

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SKIP_KEY, "1");
    }
    setSkipped(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        return;
      }
      toast.success(mode === "signup" ? "تم إنشاء الحساب" : "أهلاً بعودتك");
      await refreshCurrentUser();
      // overlay will hide automatically once useCurrentUser flips to a user
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
        >
          <div className="w-full max-w-md px-8">
            {/* Brand */}
            <div className="mb-10 flex justify-center">
              <Logo variant="wordmark" height={36} />
            </div>

            {/* Mode tabs */}
            <div className="mb-6 flex rounded-xl bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                  mode === "login"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900",
                )}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                  mode === "signup"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900",
                )}
              >
                حساب جديد
              </button>
            </div>

            {/* Heading */}
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-extrabold text-stone-900">
                {mode === "login" ? "تسجيل الدخول" : "ابدأ مع ركاز"}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                {mode === "login"
                  ? "أهلاً بك في ركاز 👋"
                  : "اسم مستخدم وكلمة مرور — هذا كل ما نطلبه."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                icon={<User size={14} />}
                label="اسم المستخدم"
                type="text"
                autoComplete="username"
                value={username}
                onChange={setUsername}
                autoFocus
                minLength={3}
                maxLength={32}
                pattern="[a-zA-Z0-9_.\-]+"
                required
                placeholder="username"
              />
              <Field
                icon={<Lock size={14} />}
                label="كلمة المرور"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={setPassword}
                minLength={6}
                required
                placeholder="••••••••"
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {busy
                  ? "جارٍ المعالجة…"
                  : mode === "login"
                    ? "دخول"
                    : "أنشئ حسابي"}
              </button>
            </form>

            {/* Mode swap link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-stone-500">
                {mode === "login" ? "ما عندك حساب؟" : "عندك حساب بالفعل؟"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-brand hover:underline"
                >
                  {mode === "login" ? "سجّل الآن" : "سجّل دخول"}
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-sm text-stone-400">أو</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Skip */}
            <button
              type="button"
              onClick={handleSkip}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50"
            >
              تصفح بدون تسجيل
              <ArrowLeft size={14} className="text-stone-400" />
            </button>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-400">
              لا نطلب بريداً — كلمة المرور غير قابلة للاسترجاع، احفظها لنفسك.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  autoComplete,
  autoFocus,
  minLength,
  maxLength,
  pattern,
  required,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  type: "text" | "password";
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-stone-200 bg-white py-3 ps-10 pe-4 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
    </div>
  );
}
