import { describe, expect, it } from "vitest";
import { SECTION_PRESETS } from "./registry";
import type { FieldSchema } from "./schema/types";

function collectKeys(schema: FieldSchema[]): string[] {
  return schema.flatMap((f) => {
    if (f.kind === "group") return [f.key, ...collectKeys(f.fields)];
    if (f.kind === "list") return [f.key];
    return [f.key];
  });
}

describe("SECTION_PRESETS", () => {
  it.each(SECTION_PRESETS.map((p) => [p.type, p] as const))(
    "%s: createDefault produces a section with the declared type and id",
    (_label, preset) => {
      const section = preset.createDefault();
      expect(section.id).toBeTruthy();
      expect(section.type).toBe(preset.type);
      expect(section.props).toBeTruthy();
    },
  );

  it.each(SECTION_PRESETS.map((p) => [p.type, p] as const))(
    "%s: every top-level schema key exists on the default props",
    (_label, preset) => {
      const section = preset.createDefault();
      const props = section.props as Record<string, unknown>;
      const topLevelKeys = preset.schema.map((f) => f.key);
      for (const key of topLevelKeys) {
        expect(props).toHaveProperty(key);
      }
    },
  );

  it("section types are unique across the registry", () => {
    const types = SECTION_PRESETS.map((p) => p.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it("collectKeys helper handles nested groups + lists without throwing", () => {
    for (const preset of SECTION_PRESETS) {
      expect(() => collectKeys(preset.schema)).not.toThrow();
    }
  });
});
