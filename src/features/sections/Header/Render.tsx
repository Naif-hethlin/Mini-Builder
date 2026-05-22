import type { HeaderProps } from "@/features/builder/state/types";

/**
 * Renders a Header section as it would appear on the user's published website.
 *
 * Note: we intentionally style this in NEUTRAL colors (slate), not the builder's
 * brand color. The brand color is the BUILDER's accent — the sections being
 * built are the USER's content and should look generic.
 */
export default function HeaderRender({ props }: { props: HeaderProps }) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-stone-200 bg-white px-6 py-4 md:px-10">
      <a
        href={props.brand.href}
        className="text-lg font-bold tracking-tight text-stone-900"
      >
        {props.brand.label}
      </a>

      <nav className="hidden items-center gap-6 md:flex">
        {props.links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            className="text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {props.ctaButton.show && (
        <a
          href={props.ctaButton.href}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          {props.ctaButton.label}
        </a>
      )}
    </header>
  );
}
