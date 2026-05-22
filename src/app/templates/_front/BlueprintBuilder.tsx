"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlignRight,
  Camera,
  Coffee,
  Eye,
  Globe,
  Grid3x3,
  Hammer,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  MousePointerClick,
  PanelBottomDashed,
  Plus,
  Save,
  Scissors,
} from "lucide-react";
import { LogIn } from "lucide-react";
import { useAuthOverlay } from "@/features/auth/overlayState";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { UserMenu } from "@/features/auth/UserMenu";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import {
  useProjects,
  type ProjectTemplateType,
} from "@/features/projects";

type Workspace = "fresh" | "templates";

export function BlueprintBuilder() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace>("fresh");

  const startProject = async (input: {
    name: string;
    templateType?: ProjectTemplateType;
  }) => {
    // Try server first — when logged in this gives a persistent,
    // cross-device project. Anonymous users fall back to localStorage.
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; project: { id: string } };
        if (data.ok) {
          router.push(`/builder/${data.project.id}`);
          return;
        }
      }
    } catch {
      // network down → local fallback
    }
    useProjects.getState().hydrate();
    const project = useProjects.getState().create(input);
    router.push(`/builder/${project.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-stone-800">
      <Header workspace={workspace} onSwitch={setWorkspace} />
      <main className="flex w-full flex-grow flex-col items-center px-4 pb-12">
        <div className="relative h-[700px] w-full max-w-[1200px] overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl">
          <WorkspaceChrome
            workspace={workspace}
            onSave={() => toast.success("محفوظ تلقائيًا")}
            onPreviewAll={() => toast.info("المعاينة الموسعة قريبًا")}
          />

          <FreshWorkspace
            active={workspace === "fresh"}
            onStart={() =>
              startProject({ name: "مشروعي الأول" })
            }
          />
          <TemplatesWorkspace
            active={workspace === "templates"}
            onSelect={(template) =>
              startProject({
                name: templateName(template),
                templateType: template,
              })
            }
            onShowMore={() => toast.info("المزيد من القوالب قريبًا")}
          />
        </div>
      </main>
    </div>
  );
}

// =============================================================================
// Header (logo + headline + the two toggle cards)
// =============================================================================

function Header({
  workspace,
  onSwitch,
}: {
  workspace: Workspace;
  onSwitch: (next: Workspace) => void;
}) {
  return (
    <header className="relative z-10 flex flex-col items-center px-4 pt-16 pb-8 text-center">
      <div className="absolute top-5 end-5 z-20">
        <SignInChip />
      </div>

      <div className="mb-8 flex cursor-pointer items-center">
        <Logo variant="wordmark" height={32} />
      </div>

      <h1 className="mb-4 text-4xl font-extrabold text-stone-900 md:text-5xl">
        اختر بداية لمشروعك
      </h1>
      <p className="mx-auto max-w-xl text-lg leading-relaxed text-stone-500">
        الإطار الكامل للقوالب الجاهزة يصل قريبًا. حاليًا تقدر تبدأ بصفحة
        فارغة وتضيف الأقسام يدويًا، أو تختار قالبًا جاهزًا.
      </p>

      <div className="mt-12 flex w-full max-w-3xl flex-col gap-6 sm:flex-row">
        <ToggleCard
          active={workspace === "templates"}
          onClick={() => onSwitch("templates")}
          icon={<LayoutDashboard size={20} />}
          title="قوالب جاهزة"
          subtitle="اختر من قوالب جاهزة: حلاق، مقهى، مصور."
        />
        <ToggleCard
          active={workspace === "fresh"}
          onClick={() => onSwitch("fresh")}
          icon={<LayoutGrid size={20} />}
          title="ابدأ من الصفر"
          subtitle="صفحة فارغة، أنت تختار الأقسام بنفسك وتصممها."
        />
      </div>
    </header>
  );
}

function ToggleCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex-1 overflow-hidden rounded-2xl border-2 bg-white p-6 text-start transition-all duration-300",
        active
          ? "scale-105 border-brand shadow-lg ring-4 ring-brand/15"
          : "scale-95 border-stone-300 opacity-80 hover:scale-100 hover:border-brand hover:opacity-100 hover:shadow-md",
      )}
    >
      {active && (
        <span className="absolute top-0 right-0 h-full w-2 bg-brand" />
      )}
      <div className="relative z-10 flex flex-col items-start">
        <div
          className={cn(
            "mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            active
              ? "bg-brand-light text-brand"
              : "bg-stone-200 text-stone-600",
          )}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-stone-900">{title}</h3>
        <p className="mt-2 text-sm text-stone-500">{subtitle}</p>
      </div>
    </button>
  );
}

// =============================================================================
// Window chrome — traffic lights + title + Save / Preview
// =============================================================================

function WorkspaceChrome({
  workspace,
  onSave,
  onPreviewAll,
}: {
  workspace: Workspace;
  onSave: () => void;
  onPreviewAll: () => void;
}) {
  const title =
    workspace === "fresh"
      ? "مساحة العمل: بناء حر"
      : "مساحة العمل: القوالب الهيكلية";

  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-stone-100 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="ms-4 text-sm font-semibold text-brand">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={onPreviewAll}
          className="flex items-center gap-2 text-stone-500 transition-colors hover:text-brand"
        >
          <Eye size={16} /> معاينة الكل
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-1.5 text-white transition-colors hover:bg-stone-800"
        >
          <Save size={14} /> حفظ
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Fresh workspace — toolbox sidebar + blueprint canvas with demo blocks
// =============================================================================

const TOOLBOX = [
  { type: "header", label: "ترويسة", Icon: Globe },
  { type: "hero", label: "صورة بارزة", Icon: ImageIcon },
  { type: "text", label: "نص", Icon: AlignRight },
  { type: "button", label: "زر", Icon: MousePointerClick },
  { type: "gallery", label: "معرض", Icon: Grid3x3 },
  { type: "footer", label: "تذييل", Icon: PanelBottomDashed },
] as const;

function FreshWorkspace({
  active,
  onStart,
}: {
  active: boolean;
  onStart: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-blueprint-pattern absolute inset-0 h-full w-full pt-14 transition-all duration-400 ease-in-out",
        active
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      {/* Toolbox sidebar */}
      <div className="absolute top-20 right-6 z-20 flex w-64 flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-lg">
        <div className="border-b border-stone-100 bg-stone-50 p-4">
          <h4 className="flex items-center gap-2 font-bold text-stone-800">
            <Hammer size={16} className="text-brand" />
            العناصر الأساسية
          </h4>
          <p className="mt-1 text-xs text-stone-500">
            اختر عنصرًا لبدء البناء عليه
          </p>
        </div>
        <div className="grid max-h-[500px] grid-cols-2 gap-3 overflow-y-auto p-4">
          {TOOLBOX.map(({ type, label, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={onStart}
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white text-stone-400 transition-all hover:border-brand hover:bg-brand-light hover:text-brand"
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Static blueprint canvas (visual demo) */}
      <div className="relative h-full w-full overflow-hidden">
        {/* Header block */}
        <BlueprintBlock
          style={{ top: 80, left: 100 }}
          width={600}
          height={80}
          tone="blue"
          tag="Header"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50">
            <LayoutGrid size={22} />
          </div>
          <div className="flex flex-grow gap-4">
            <span className="h-2 w-16 rounded bg-blue-100" />
            <span className="h-2 w-16 rounded bg-blue-100" />
            <span className="h-2 w-16 rounded bg-blue-100" />
          </div>
          <span className="h-8 w-24 rounded-lg bg-blue-500/20" />
        </BlueprintBlock>

        {/* Hero block */}
        <BlueprintBlock
          style={{ top: 200, left: 250 }}
          width={450}
          height={300}
          tone="blue-dashed"
          tag="Hero Section"
          padded
        >
          <div className="flex h-32 w-full items-center justify-center rounded-lg bg-blue-50">
            <ImageIcon size={36} className="opacity-50" />
          </div>
          <div className="mt-2 h-6 w-3/4 rounded bg-blue-100" />
          <div className="h-3 w-full rounded bg-blue-50" />
          <div className="h-3 w-4/5 rounded bg-blue-50" />
          <div className="mt-auto flex h-10 w-32 items-center justify-center rounded-lg bg-blue-500 text-xs text-white">
            Primary CTA
          </div>
        </BlueprintBlock>

        {/* Text block */}
        <BlueprintBlock
          style={{ top: 150, left: 750 }}
          width={300}
          height={150}
          tone="gray"
          tag="Text Content"
          padded
        >
          <div className="h-4 w-1/2 rounded bg-stone-200" />
          <div className="mt-2 h-2 w-full rounded bg-stone-100" />
          <div className="h-2 w-full rounded bg-stone-100" />
          <div className="h-2 w-full rounded bg-stone-100" />
          <div className="h-2 w-2/3 rounded bg-stone-100" />
        </BlueprintBlock>

        {/* Gallery block */}
        <BlueprintBlock
          style={{ top: 510, left: 150 }}
          width={400}
          height={180}
          tone="brand"
          tag="Gallery"
          padded
        >
          <div className="h-4 w-1/3 rounded bg-brand-light" />
          <div className="grid flex-grow grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-lg bg-brand-light"
              >
                <ImageIcon size={14} className="opacity-30" />
              </div>
            ))}
          </div>
        </BlueprintBlock>
      </div>
    </div>
  );
}

// =============================================================================
// Templates workspace — sidebar + template preview cards on blueprint canvas
// =============================================================================

const TEMPLATE_CARDS: Array<{
  template: ProjectTemplateType;
  title: string;
  english: string;
  Icon: typeof Scissors;
  tone: "amber" | "orange" | "purple";
}> = [
  {
    template: "barber",
    title: "حلاق / صالون",
    english: "Barber Shop",
    Icon: Scissors,
    tone: "amber",
  },
  {
    template: "coffee",
    title: "مقهى / كافيه",
    english: "Coffee Shop",
    Icon: Coffee,
    tone: "orange",
  },
  {
    template: "photography",
    title: "مصور فوتوغرافي",
    english: "Photographer",
    Icon: Camera,
    tone: "purple",
  },
];

const TONE_CLASSES: Record<
  "amber" | "orange" | "purple",
  {
    chip: string;
    iconText: string;
    gradient: string;
    title: string;
    swatch: string;
  }
> = {
  amber: {
    chip: "bg-amber-100 text-amber-600",
    iconText: "text-amber-600",
    gradient: "from-amber-50 to-orange-50",
    title: "text-amber-800",
    swatch: "bg-amber-200",
  },
  orange: {
    chip: "bg-orange-100 text-orange-600",
    iconText: "text-orange-600",
    gradient: "from-orange-50 to-amber-50",
    title: "text-orange-800",
    swatch: "bg-orange-200",
  },
  purple: {
    chip: "bg-purple-100 text-purple-600",
    iconText: "text-purple-600",
    gradient: "from-purple-50 to-indigo-50",
    title: "text-purple-800",
    swatch: "bg-purple-200",
  },
};

function TemplatesWorkspace({
  active,
  onSelect,
  onShowMore,
}: {
  active: boolean;
  onSelect: (template: ProjectTemplateType) => void;
  onShowMore: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-blueprint-pattern absolute inset-0 h-full w-full pt-14 transition-all duration-400 ease-in-out",
        active
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      {/* Sidebar */}
      <div className="absolute top-20 right-6 z-20 flex max-h-[500px] w-72 flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-lg">
        <div className="border-b border-stone-100 bg-gradient-to-r from-brand-light to-white p-4">
          <h4 className="flex items-center gap-2 font-bold text-stone-800">
            <LayoutDashboard size={16} className="text-brand" />
            قوالب جاهزة
          </h4>
          <p className="mt-1 text-xs text-stone-500">
            اضغط على قالب لبدء مشروعك بمحتواه
          </p>
        </div>
        <div className="space-y-3 overflow-y-auto p-4">
          {TEMPLATE_CARDS.map(({ template, title, english, Icon, tone }) => (
            <button
              key={template}
              type="button"
              onClick={() => onSelect(template)}
              className="group block w-full cursor-pointer rounded-xl border-2 border-dashed border-stone-200 p-3 text-start transition-all hover:border-brand hover:bg-brand-light/40"
            >
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    TONE_CLASSES[tone].chip,
                  )}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-stone-800">
                    {title}
                  </h5>
                  <p className="text-[10px] text-stone-400">{english}</p>
                </div>
              </div>
              <div className="flex h-12 items-center justify-center gap-1 rounded-lg border border-stone-100 bg-stone-50">
                <span
                  className={cn("h-6 w-6 rounded", TONE_CLASSES[tone].swatch)}
                />
                <span className="h-2 w-16 rounded bg-stone-200" />
                <span className="h-2 w-8 rounded bg-stone-200" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas with preview cards */}
      <div className="relative h-full w-full overflow-hidden">
        <TemplatePreviewCard
          style={{ top: 80, left: 100 }}
          template={TEMPLATE_CARDS[0]}
          tagAr="حلاق"
          onClick={() => onSelect("barber")}
        />
        <TemplatePreviewCard
          style={{ top: 80, left: 450 }}
          template={TEMPLATE_CARDS[1]}
          tagAr="مقهى"
          onClick={() => onSelect("coffee")}
        />
        <TemplatePreviewCard
          style={{ top: 420, left: 100 }}
          template={TEMPLATE_CARDS[2]}
          tagAr="مصور"
          onClick={() => onSelect("photography")}
        />

        {/* "More coming soon" card */}
        <button
          type="button"
          onClick={onShowMore}
          style={{
            position: "absolute",
            top: 420,
            left: 450,
            width: 320,
            height: 280,
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-white text-stone-400 shadow-sm transition-all hover:border-brand hover:text-brand hover:shadow-lg"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <Plus size={26} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-stone-600">المزيد من القوالب</p>
            <p className="mt-1 text-xs text-stone-400">قريبًا</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function TemplatePreviewCard({
  style,
  template,
  tagAr,
  onClick,
}: {
  style: React.CSSProperties;
  template: (typeof TEMPLATE_CARDS)[number];
  tagAr: string;
  onClick: () => void;
}) {
  const { Icon, title, english, tone } = template;
  const t = TONE_CLASSES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...style, width: 320 }}
      className="absolute cursor-pointer overflow-hidden rounded-2xl border-2 border-brand/40 bg-white text-start shadow-lg transition-all hover:border-brand hover:shadow-xl"
    >
      <div
        className={cn(
          "relative flex h-40 flex-col bg-gradient-to-br",
          t.gradient,
        )}
      >
        <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80">
          <Icon size={16} className={t.iconText} />
        </div>
        <div className="mt-auto p-4">
          <h4 className={cn("text-lg font-bold", t.title)}>{title}</h4>
          <p className="text-xs opacity-70">{english}</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <div className="h-16 w-16 rounded-lg bg-stone-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-stone-200" />
            <div className="h-2 w-1/2 rounded bg-stone-100" />
            <div className={cn("h-6 w-24 rounded-full", t.chip)} />
          </div>
        </div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-xs text-stone-400">
          <ImageIcon size={14} className="me-2" /> معاينة المحتوى
        </div>
      </div>
      <span className="absolute -top-3 -right-3 rounded bg-brand px-2 py-1 text-[10px] font-bold text-white">
        {tagAr}
      </span>
    </button>
  );
}

// =============================================================================
// BlueprintBlock — visual demo block on the fresh workspace canvas.
// =============================================================================

function BlueprintBlock({
  style,
  width,
  height,
  tone,
  tag,
  padded = false,
  children,
}: {
  style: React.CSSProperties;
  width: number;
  height: number;
  tone: "blue" | "blue-dashed" | "gray" | "brand";
  tag: string;
  padded?: boolean;
  children: React.ReactNode;
}) {
  const toneClass: Record<typeof tone, string> = {
    blue: "border-blue-500 text-blue-500",
    "blue-dashed": "border-blue-500 border-dashed text-blue-500",
    gray: "border-stone-300 text-stone-500",
    brand: "border-brand/50 text-brand",
  };
  const tagClass: Record<typeof tone, string> = {
    blue: "bg-blue-500",
    "blue-dashed": "bg-blue-500",
    gray: "bg-stone-400",
    brand: "bg-brand",
  };
  return (
    <div
      style={{ ...style, width, height }}
      className={cn(
        "absolute flex rounded-xl border-2 bg-white shadow-sm",
        padded ? "flex-col gap-3 p-6" : "items-center gap-6 px-6",
        toneClass[tone],
      )}
    >
      {children}
      <span
        className={cn(
          "absolute -top-3 -right-3 rounded px-2 py-1 text-[10px] font-bold text-white",
          tagClass[tone],
        )}
      >
        {tag}
      </span>
    </div>
  );
}

function templateName(template: ProjectTemplateType): string {
  switch (template) {
    case "barber":
      return "صالون الحلاقة";
    case "coffee":
      return "مقهى الأحلام";
    case "photography":
      return "عدسة الإبداع";
  }
}

/**
 * Top-end chip: signed-in users see their UserMenu; anonymous users see a
 * "تسجيل الدخول" button that re-opens the AuthOverlay (clearing the
 * "browse without login" skip flag for the session).
 */
function SignInChip() {
  const openAuth = useAuthOverlay((s) => s.open);
  const { user, loading } = useCurrentUser();

  if (loading) return null;
  if (user) return <UserMenu />;

  return (
    <button
      type="button"
      onClick={openAuth}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-medium text-white shadow-md shadow-brand/20 transition-colors hover:bg-brand-dark"
    >
      <LogIn size={12} />
      تسجيل الدخول
    </button>
  );
}
