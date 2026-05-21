import { Briefcase, Camera, MessageCircle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FooterProps } from "@/features/builder/state/types";

// lucide v1 dropped brand glyphs (Twitter/Instagram/Linkedin/Whatsapp) — likely
// for trademark reasons. We substitute neutral icons that still read clearly.
const SOCIAL_ICON: Record<
  FooterProps["socials"][number]["platform"],
  LucideIcon
> = {
  twitter: X,
  instagram: Camera,
  linkedin: Briefcase,
  whatsapp: MessageCircle,
};

export default function FooterRender({ props }: { props: FooterProps }) {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr,1fr]">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold tracking-tight text-stone-900">
              {props.brand.text}
            </p>
            {props.brand.tagline && (
              <p className="mt-1.5 text-sm text-stone-600">
                {props.brand.tagline}
              </p>
            )}
            {props.socials.length > 0 && (
              <div className="mt-4 flex gap-2">
                {props.socials.map((s) => {
                  const Icon = SOCIAL_ICON[s.platform];
                  return (
                    <a
                      key={s.id}
                      href={s.href}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                      aria-label={s.platform}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Link columns */}
          {props.columns.map((col) => (
            <div key={col.id}>
              <p className="mb-3 text-sm font-semibold text-stone-900">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-600 transition-colors hover:text-stone-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="mt-10 border-t border-stone-200 pt-6">
          <p className="text-xs text-stone-500">{props.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
