// Schema for the schema-driven section editor.
//
// Each preset section declares a FieldSchema[] describing its editable
// fields. The Form component (Form.tsx) iterates the schema and renders
// the right input per field kind. Editing a field updates the section's
// props via the builder store's updateSection action.
//
// IMPORTANT: schemas describe the SHAPE of the form, not the data model.
// They mirror the section's TS prop type but live alongside it so the form
// stays declarative.

import type { ReactNode } from "react";

export type SelectOption = { value: string; label: string };

export type FieldSchema =
  | {
      kind: "text";
      key: string;
      label: string;
      placeholder?: string;
    }
  | {
      kind: "textarea";
      key: string;
      label: string;
      rows?: number;
      placeholder?: string;
    }
  | {
      kind: "url";
      key: string;
      label: string;
      placeholder?: string;
    }
  | {
      kind: "image-url";
      key: string;
      label: string;
      placeholder?: string;
    }
  | {
      kind: "color";
      key: string;
      label: string;
    }
  | {
      kind: "icon";
      key: string;
      label: string;
    }
  | {
      kind: "shape";
      key: string;
      label: string;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      options: SelectOption[];
    }
  | {
      kind: "link";
      key: string;
      label: string;
    }
  | {
      kind: "toggleable-link";
      key: string;
      label: string;
    }
  | {
      kind: "list";
      key: string;
      label: string;
      itemSchema: FieldSchema[];
      createItem: () => Record<string, unknown>;
      itemTitle?: (item: Record<string, unknown>, index: number) => ReactNode;
      min?: number;
      max?: number;
    }
  | {
      kind: "group";
      key: string;
      label: string;
      fields: FieldSchema[];
    };

export type FormValue = Record<string, unknown>;
