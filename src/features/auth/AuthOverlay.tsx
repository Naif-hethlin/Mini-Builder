"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import { refreshCurrentUser, useCurrentUser } from "./useCurrentUser";

const SKIP_KEY = "rekaz-builder/auth/skipped";

type Mode = "login" | "signup";

/**
 * Full-screen auth gate stacked on top of /templates.
 *
 *  - signup: phone + name (no password, no email)
 *  - login : phone only (server looks up by phone, no secret check)
 *
 * "تصفح بدون تسجيل" persists a flag in sessionStorage so the overlay
 * stays dismissed for the rest of the tab session.
 */
export function AuthOverlay() {
  const { user, loading } = useCurrentUser();
  const [skipped, setSkipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
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
      const body =
        mode === "signup" ? { phone, name } : { phone };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        return;
      }
      toast.success(mode === "signup" ? "تم إنشاء الحساب" : "أهلاً بعودتك");
      await refreshCurrentUser();
      // overlay hides automatically once useCurrentUser flips to a user
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
                  ? "ادخل رقم الهاتف اللي سجّلت فيه — لا نطلب كلمة مرور."
                  : "اسمك ورقمك فقط — ولا نحتاج بريد ولا كلمة مرور."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <Field
                  icon={<User size={14} />}
                  label="الاسم"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={setName}
                  autoFocus
                  minLength={2}
                  maxLength={64}
                  required
                  placeholder="اسمك الكامل"
                  dir="auto"
                />
              )}

              <Field
                icon={<Phone size={14} />}
                label="رقم الهاتف"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={setPhone}
                autoFocus={mode === "login"}
                minLength={8}
                maxLength={20}
                required
                placeholder="05xxxxxxxx"
                dir="ltr"
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
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                  }}
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
  inputMode,
  autoFocus,
  minLength,
  maxLength,
  required,
  placeholder,
  dir,
}: {
  icon: React.ReactNode;
  label: string;
  type: "text" | "tel";
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  inputMode?: "tel" | "text";
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  dir?: "ltr" | "rtl" | "auto";
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
          inputMode={inputMode}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          dir={dir}
          className="w-full rounded-xl border border-stone-200 bg-white py-3 ps-10 pe-4 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
    </div>
  );
}
