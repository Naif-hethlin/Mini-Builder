// =============================================================================
// Icon library — backed by Iconify (~200K icons across 150+ collections).
//
// The Icon primitive stores `name` as a fully-qualified Iconify id in the
// form `<prefix>:<icon>` — e.g. `lucide:sparkles`, `mdi:home`, `ph:rocket`.
// The renderer hands this directly to <Icon /> from @iconify/react, which
// streams the SVG from the Iconify CDN on first use and caches it.
//
// We also keep a small curated suggestion list grouped by category, used
// by the picker when the user hasn't typed a search query yet.
// =============================================================================

export type IconName = string; // "<prefix>:<name>"

/**
 * Backward compat: older icon primitives stored plain Lucide PascalCase
 * names (e.g. "Sparkles") before Iconify was introduced. We normalize those
 * to lucide:<kebab-case> so old projects keep rendering.
 */
export function normalizeIconName(raw: string): IconName {
  const name = raw?.trim();
  if (!name) return "lucide:sparkles";
  if (name.includes(":")) return name;
  const kebab = name
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `lucide:${kebab}`;
}

export type IconCategory = {
  id: string;
  label: string;
  icons: IconName[];
};

// Curated suggestions per category — used to populate the picker when no
// search query is active. Mix-and-match across collections so users see
// what's available beyond Lucide.
export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: "basic",
    label: "أساسي",
    icons: [
      "lucide:sparkles",
      "lucide:star",
      "lucide:heart",
      "lucide:check",
      "lucide:x",
      "lucide:plus",
      "lucide:minus",
      "ph:flame-fill",
    ],
  },
  {
    id: "navigation",
    label: "تنقل",
    icons: [
      "lucide:home",
      "lucide:menu",
      "lucide:search",
      "lucide:chevron-right",
      "lucide:chevron-left",
      "lucide:arrow-right",
      "lucide:arrow-left",
      "lucide:arrow-up-right",
      "lucide:external-link",
    ],
  },
  {
    id: "communication",
    label: "تواصل",
    icons: [
      "lucide:phone",
      "lucide:mail",
      "lucide:message-circle",
      "lucide:send",
      "lucide:bell",
      "mdi:whatsapp",
      "mdi:telegram",
    ],
  },
  {
    id: "social",
    label: "اجتماعي",
    icons: [
      "mdi:facebook",
      "mdi:instagram",
      "mdi:twitter",
      "mdi:linkedin",
      "mdi:youtube",
      "mdi:github",
      "mdi:tiktok",
      "mdi:snapchat",
    ],
  },
  {
    id: "commerce",
    label: "متجر",
    icons: [
      "lucide:shopping-cart",
      "lucide:shopping-bag",
      "lucide:credit-card",
      "lucide:tag",
      "lucide:truck",
      "lucide:percent",
      "ph:wallet-bold",
    ],
  },
  {
    id: "media",
    label: "وسائط",
    icons: [
      "lucide:image",
      "lucide:camera",
      "lucide:video",
      "lucide:music",
      "lucide:play",
      "lucide:pause",
      "lucide:headphones",
    ],
  },
  {
    id: "status",
    label: "حالة",
    icons: [
      "lucide:alert-circle",
      "lucide:check-circle",
      "lucide:x-circle",
      "lucide:info",
      "lucide:alert-triangle",
      "lucide:shield-check",
      "lucide:award",
      "lucide:thumbs-up",
    ],
  },
  {
    id: "people",
    label: "أشخاص",
    icons: [
      "lucide:user",
      "lucide:users",
      "lucide:user-circle",
      "lucide:user-plus",
      "ph:hand-waving-fill",
    ],
  },
  {
    id: "time",
    label: "وقت",
    icons: [
      "lucide:clock",
      "lucide:calendar",
      "lucide:calendar-days",
      "lucide:timer",
    ],
  },
  {
    id: "files",
    label: "ملفات",
    icons: [
      "lucide:file",
      "lucide:file-text",
      "lucide:folder",
      "lucide:download",
      "lucide:upload",
    ],
  },
  {
    id: "geo",
    label: "جغرافيا",
    icons: [
      "lucide:map-pin",
      "lucide:map",
      "lucide:compass",
      "lucide:navigation",
      "lucide:globe",
    ],
  },
  {
    id: "food",
    label: "طعام وشراب",
    icons: [
      "lucide:coffee",
      "lucide:utensils",
      "lucide:cake",
      "lucide:cookie",
      "lucide:wine",
      "lucide:pizza",
      "lucide:beef",
      "lucide:ice-cream",
      "ph:hamburger-bold",
    ],
  },
  {
    id: "services",
    label: "خدمات",
    icons: [
      "lucide:scissors",
      "lucide:gift",
      "lucide:trophy",
      "lucide:crown",
      "lucide:rocket",
      "lucide:target",
      "lucide:flame",
    ],
  },
  {
    id: "weather",
    label: "طقس",
    icons: ["lucide:sun", "lucide:moon", "lucide:cloud", "lucide:cloud-rain"],
  },
];

export const ALL_DEFAULT_ICONS: IconName[] = ICON_CATEGORIES.flatMap(
  (c) => c.icons,
);

// =============================================================================
// Iconify search API.
//
// https://api.iconify.design/search?query=...&limit=...
// Returns a list of icon ids and metadata. We hit it on user search input.
// =============================================================================

export type IconifySearchResponse = {
  icons: string[];
  total: number;
  limit: number;
};

const SEARCH_ENDPOINT = "https://api.iconify.design/search";

// Collections we prefer to surface first (popular + comprehensive).
const PREFERRED_COLLECTIONS = [
  "lucide",
  "mdi",
  "ph",
  "heroicons",
  "material-symbols",
  "fa6-solid",
];

export async function searchIcons(
  query: string,
  limit = 64,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("query", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("prefixes", PREFERRED_COLLECTIONS.join(","));
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error("search failed");
  const data = (await res.json()) as IconifySearchResponse;
  return data.icons ?? [];
}
