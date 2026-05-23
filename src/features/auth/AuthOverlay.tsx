"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import { SKIP_KEY } from "./overlayState";
import { refreshCurrentUser, useCurrentUser } from "./useCurrentUser";

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
export function AuthOverlay({
  initialAuthed = false,
}: {
  /** Server-detected auth status — used for the first paint so we don't
   *  flash the page underneath while useCurrentUser is still fetching. */
  initialAuthed?: boolean;
} = {}) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Old "تصفح بدون تسجيل" path was removed — anyone who has the legacy
  // SKIP_KEY in sessionStorage from a previous session should also lose
  // their bypass on the next visit, otherwise they'd still get into the
  // builder without an account.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(SKIP_KEY);
  }, []);

  // Server-known authed visitors should NEVER see the overlay flash, even
  // before useCurrentUser settles. Client-known auth still wins.
  const isAuthed = user !== null || (initialAuthed && loading);
  const show = !isAuthed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // Mirror the server validator so we surface a clear message before the
    // round-trip. Canonical form is 05xxxxxxxx (Saudi mobile).
    if (!/^05\d{8}$/.test(phone)) {
      setError("رقم الجوال لازم يبدأ بـ 05 ويتكوّن من 10 أرقام");
      setBusy(false);
      return;
    }
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

      // Returning visitor → straight to their dashboard (most-recent
      // project). If they somehow have no project yet, fall back to
      // /templates so they can start one.
      // Fresh signups always stay on /templates; the overlay hides
      // itself once useCurrentUser flips to a user, revealing the
      // BuilderShowcase underneath.
      if (mode === "login" && data.projectId) {
        router.push(`/dashboard/${data.projectId}`);
        return;
      }
      await refreshCurrentUser();
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
          <div className="w-full max-w-md px-5 sm:px-8">
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
                label="رقم الجوال"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                value={phone}
                // Force digits-only as the user types so they can't
                // submit "+966…" or "0501-234567" — server expects
                // exactly "05xxxxxxxx".
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                autoFocus={mode === "login"}
                minLength={10}
                maxLength={10}
                pattern="05[0-9]{8}"
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

            {/* Demo link — replaces the old "skip auth" path so anonymous
                visitors can still see a real Rekaz-styled site (read-only)
                without bypassing the auth gate around the actual builder. */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-sm text-stone-400">أو</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <a
              href="/demo"
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50"
            >
              شاهد عرضاً تجريبياً
              <ArrowLeft size={14} className="text-stone-400" />
            </a>
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
  pattern,
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
  inputMode?: "tel" | "text" | "numeric";
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
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
          pattern={pattern}
          required={required}
          placeholder={placeholder}
          dir={dir}
          className="w-full rounded-xl border border-stone-200 bg-white py-3 ps-10 pe-4 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
    </div>
  );
}
