// =============================================================================
// Shape library — curated set of fill-friendly SVG paths on a 100×100
// viewBox. Each entry is a unique kind the Shape primitive can be set to;
// the renderer fills the path with `fillColor` and outlines it with
// `borderColor` when `borderWidth > 0`. Paths use the full 0..100 range
// so the shape fills its geometry box completely.
// =============================================================================

export type ShapeKind = string;

export type ShapeDef = {
  /** SVG path d on a 100×100 viewBox. */
  path: string;
  /** Stretch to the box (preserveAspectRatio="none"). */
  stretch?: boolean;
  /** Display label in the picker. */
  label: string;
};

export const SHAPE_LIBRARY: Record<ShapeKind, ShapeDef> = {
  square: { label: "مربع", stretch: true, path: "M0,0 H100 V100 H0 Z" },
  circle: {
    label: "دائرة",
    stretch: true,
    path: "M50,0 A50,50 0 1,0 50,100 A50,50 0 1,0 50,0 Z",
  },
  triangle: { label: "مثلث", stretch: true, path: "M50,0 L100,100 L0,100 Z" },
  diamond: { label: "معيّن", stretch: true, path: "M50,0 L100,50 L50,100 L0,50 Z" },
  pentagon: {
    label: "خماسي",
    stretch: true,
    path: "M50,0 L100,38 L82,100 L18,100 L0,38 Z",
  },
  hexagon: {
    label: "سداسي",
    stretch: true,
    path: "M25,0 L75,0 L100,50 L75,100 L25,100 L0,50 Z",
  },
  octagon: {
    label: "ثماني",
    stretch: true,
    path: "M30,0 L70,0 L100,30 L100,70 L70,100 L30,100 L0,70 L0,30 Z",
  },
  star: {
    label: "نجمة",
    stretch: true,
    path: "M50,0 L61,35 L98,35 L68,57 L79,92 L50,71 L21,92 L32,57 L2,35 L39,35 Z",
  },
  heart: {
    label: "قلب",
    stretch: true,
    path: "M50,90 C50,90 5,60 5,30 C5,15 17,5 30,5 C40,5 47,11 50,18 C53,11 60,5 70,5 C83,5 95,15 95,30 C95,60 50,90 50,90 Z",
  },
  plus: {
    label: "زائد",
    stretch: true,
    path: "M35,0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z",
  },
  cross: {
    label: "إكس",
    stretch: true,
    path: "M14,0 L50,36 L86,0 L100,14 L64,50 L100,86 L86,100 L50,64 L14,100 L0,86 L36,50 L0,14 Z",
  },
  "arrow-right": {
    label: "سهم يمين",
    stretch: true,
    path: "M0,30 H60 V0 L100,50 L60,100 V70 H0 Z",
  },
  "arrow-left": {
    label: "سهم يسار",
    stretch: true,
    path: "M100,30 H40 V0 L0,50 L40,100 V70 H100 Z",
  },
  "arrow-up": {
    label: "سهم أعلى",
    stretch: true,
    path: "M30,100 V40 H0 L50,0 L100,40 H70 V100 Z",
  },
  "arrow-down": {
    label: "سهم أسفل",
    stretch: true,
    path: "M30,0 V60 H0 L50,100 L100,60 H70 V0 Z",
  },
  parallelogram: {
    label: "متوازي",
    stretch: true,
    path: "M20,0 H100 L80,100 H0 Z",
  },
  trapezoid: {
    label: "شبه منحرف",
    stretch: true,
    path: "M25,0 H75 L100,100 H0 Z",
  },
  speech: {
    label: "فقاعة كلام",
    stretch: true,
    path: "M10,5 H90 Q98,5 98,15 V70 Q98,80 90,80 H50 L30,98 L35,80 H10 Q2,80 2,70 V15 Q2,5 10,5 Z",
  },
  "rounded-rect": {
    label: "مستطيل مدور",
    stretch: true,
    path: "M15,0 H85 Q100,0 100,15 V85 Q100,100 85,100 H15 Q0,100 0,85 V15 Q0,0 15,0 Z",
  },
  blob: {
    label: "بقعة",
    stretch: true,
    path: "M50,0 C70,5 95,15 95,40 C95,65 80,90 50,98 C20,90 5,65 5,40 C5,15 30,5 50,0 Z",
  },
};

export const SHAPE_KIND_KEYS: ShapeKind[] = Object.keys(SHAPE_LIBRARY);

export function getShape(kind: string): ShapeDef {
  return SHAPE_LIBRARY[kind] ?? SHAPE_LIBRARY.square;
}
