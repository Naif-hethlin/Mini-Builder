import type { FieldSchema } from "../schema/types";

/**
 * Section-level schema for Canvas — height + background only. The
 * primitives inside are edited via primitive selection (see EditPanel).
 */
export const canvasSchema: FieldSchema[] = [
  {
    kind: "select",
    key: "background",
    label: "خلفية اللوحة",
    options: [
      { value: "transparent", label: "شفافة" },
      { value: "white", label: "أبيض" },
      { value: "stone", label: "حجري" },
      { value: "peach", label: "خوخي" },
      { value: "mint", label: "نعناع" },
    ],
  },
];
