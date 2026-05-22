"use client";

import { ChevronDown, LogIn, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { refreshCurrentUser, useCurrentUser } from "./useCurrentUser";

/**
 * Compact user pill — shows the username and a dropdown with logout when
 * authenticated, or a "تسجيل دخول" link otherwise. Sized to fit in dashboard
 * top bars / builder toolbars.
 */
export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  if (loading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-stone-100" />
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-stone-200 px-3 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand"
      >
        <LogIn size={12} />
        تسجيل الدخول
      </Link>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    await refreshCurrentUser();
    toast.success("تم تسجيل الخروج");
    router.push("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
          {user.username.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-[100px] truncate">{user.username}</span>
        <ChevronDown size={11} className="text-stone-400" />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
          <div className="border-b border-stone-100 px-3 py-2 text-xs">
            <p className="text-stone-500">مسجّل دخول كـ</p>
            <p className="truncate font-medium text-stone-900">
              {user.username}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-start text-xs font-medium text-stone-700 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={12} />
            تسجيل الخروج
            <UserIcon size={10} className="ms-auto opacity-0" />
          </button>
        </div>
      )}
    </div>
  );
}
