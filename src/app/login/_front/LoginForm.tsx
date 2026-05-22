"use client";

import {
  ArrowLeft,
  Camera,
  Coffee,
  LayoutGrid,
  Lock,
  Scissors,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { refreshCurrentUser } from "@/features/auth/useCurrentUser";
import { useProjects, type ProjectTemplateType } from "@/features/projects";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";

type Mode = "login" | "signup";

type StarterChoice =
  | { kind: "scratch" }
  | { kind: "template"; template: ProjectTemplateType };

type StarterMeta = {
  choice: StarterChoice;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  tone: "stone" | "amber" | "orange" | "purple";
};

const STARTERS: StarterMeta[] = [
  {
    choice: { kind: "scratch" },
    title: "من الصفر",
    subtitle: "صفحة فارغة، أنت تختار الأقسام.",
    Icon: LayoutGrid,
    tone: "stone",
  },
  {
    choice: { kind: "template", template: "barber" },
    title: "صالون / حلاق",
    subtitle: "حجوزات، خدمات، فريق.",
    Icon: Scissors,
    tone: "amber",
  },
  {
    choice: { kind: "template", template: "coffee" },
    title: "مقهى",
    subtitle: "قائمة، صور، موقع.",
    Icon: Coffee,
    tone: "orange",
  },
  {
    choice: { kind: "template", template: "photography" },
    title: "مصور",
    subtitle: "معرض أعمال + باقات.",
    Icon: Camera,
    tone: "purple",
  },
];

const TONE_CLASSES: Record<StarterMeta["tone"], string> = {
  stone: "bg-stone-100 text-stone-600",
  amber: "bg-amber-100 text-amber-600",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-600",
};

const STARTER_NAMES: Record<ProjectTemplateType, string> = {
  barber: "صالون الحلاقة",
  coffee: "مقهى الأحلام",
  photography: "عدسة الإبداع",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Honor a ?next= redirect for the login (returning user) path. Signup
  // and explicit template picks override it — the user opted to build now.
  const next = searchParams.get("next");

  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [starter, setStarter] = useState<StarterChoice>({ kind: "scratch" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const pickedTemplate = starter.kind === "template";
      // login + still on default "scratch" + we have a `next` → respect it.
      if (mode === "login" && !pickedTemplate && next) {
        router.push(next);
        return;
      }

      // Create the project on the server so it's tied to this user's
      // account and survives logout / cross-device.
      const createBody =
        starter.kind === "scratch"
          ? { name: "مشروعي الأول" }
          : {
              name: STARTER_NAMES[starter.template],
              templateType: starter.template,
            };
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(createBody),
      });
      const created = await createRes.json();
      if (!createRes.ok || !created.ok) {
        setError(created.error || "تعذر إنشاء المشروع");
        return;
      }
      // Hydrate into the local store so the builder feels instant.
      useProjects.getState().hydrate();
      useProjects.setState({
        projects: {
          ...useProjects.getState().projects,
          [created.project.id]: created.project,
        },
      });
      router.push(`/builder/${created.project.id}`);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="bg-animated-gradient relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-8 flex justify-center">
          <Logo variant="wordmark" height={36} />
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl md:grid-cols-[1fr,1.1fr]">
          {/* ── Auth form column ────────────────────────────────────── */}
          <div className="border-b border-stone-100 p-7 md:border-b-0 md:border-s md:border-stone-100">
            <div className="mb-1 flex rounded-xl bg-stone-100 p-1">
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
            </div>

            <h1 className="mt-5 text-xl font-bold text-stone-900">
              {mode === "signup" ? "ابدأ بدقيقة واحدة" : "أهلاً بعودتك"}
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              {mode === "signup"
                ? "اسم مستخدم وكلمة مرور — هذا كل ما نطلبه."
                : "ادخل بياناتك لاستئناف العمل على مشاريعك."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
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
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {busy
                  ? "جارٍ المعالجة…"
                  : starter.kind === "scratch"
                    ? mode === "signup"
                      ? "أنشئ حسابي وابدأ"
                      : "دخول"
                    : `ابدأ بقالب: ${STARTER_NAMES[starter.template]}`}
                <ArrowLeft size={14} />
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-stone-400">
              بدون بريد، بدون استرجاع كلمة المرور — كلمة المرور غير قابلة
              للاسترجاع، احفظها لنفسك.
            </p>
          </div>

          {/* ── Starter chooser column ──────────────────────────────── */}
          <div className="bg-tint-peach/40 p-7">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-stone-900">
                وش تبني الحين؟
              </h2>
            </div>
            <p className="mb-4 text-xs text-stone-500">
              اختياري — تقدر تختار قالباً جاهزاً أو تبدأ من الصفر. اللي
              تختاره الآن ينفتح بعد الدخول مباشرة.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {STARTERS.map((meta) => {
                const selected =
                  starter.kind === meta.choice.kind &&
                  (meta.choice.kind === "scratch" ||
                    (starter.kind === "template" &&
                      starter.template === meta.choice.template));
                return (
                  <button
                    key={
                      meta.choice.kind === "scratch"
                        ? "scratch"
                        : meta.choice.template
                    }
                    type="button"
                    onClick={() => setStarter(meta.choice)}
                    className={cn(
                      "group rounded-2xl border-2 bg-white p-3 text-start transition-all",
                      selected
                        ? "border-brand shadow-md ring-4 ring-brand/15"
                        : "border-stone-200 hover:border-brand/60 hover:shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
                        TONE_CLASSES[meta.tone],
                      )}
                    >
                      <meta.Icon size={16} />
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {meta.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                      {meta.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
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
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-stone-700">
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
          className="h-11 w-full rounded-xl border border-stone-200 bg-white ps-9 pe-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
        />
      </div>
    </div>
  );
}
