"use client";

import {
  ColorField,
  IconField,
  ImageUrlField,
  LinkField,
  ListField,
  SelectField,
  ShapeField,
  TextField,
  TextareaField,
  ToggleableLinkField,
} from "./fields";
import type { FieldSchema, FormValue } from "./types";

/**
 * Renders a FieldSchema[] as a form bound to `value`. Each field change
 * builds a new value via spread and calls onChange.
 *
 * Form is recursive — ListField hands children back here to render each
 * item's sub-form.
 */
export function Form({
  value,
  schema,
  onChange,
}: {
  value: FormValue;
  schema: FieldSchema[];
  onChange: (next: FormValue) => void;
}) {
  const set = (key: string, next: unknown) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      {schema.map((field) => {
        const current = value?.[field.key];

        switch (field.kind) {
          case "text":
          case "url":
            return (
              <TextField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "image-url":
            return (
              <ImageUrlField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "textarea":
            return (
              <TextareaField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "select":
            return (
              <SelectField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "color":
            return (
              <ColorField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "icon":
            return (
              <IconField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "shape":
            return (
              <ShapeField
                key={field.key}
                field={field}
                value={(current as string) ?? ""}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "link":
            return (
              <LinkField
                key={field.key}
                field={field}
                value={current as { label: string; href: string }}
                onChange={(v) => set(field.key, v)}
              />
            );
          case "toggleable-link":
            return (
              <ToggleableLinkField
                key={field.key}
                field={field}
                value={
                  current as { label: string; href: string; show: boolean }
                }
                onChange={(v) => set(field.key, v)}
              />
            );
          case "list":
            return (
              <ListField
                key={field.key}
                field={field}
                value={(current as FormValue[]) ?? []}
                onChange={(v) => set(field.key, v)}
                Renderer={Form}
              />
            );
          case "group":
            return (
              <div
                key={field.key}
                className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <p className="text-xs font-medium text-stone-700">
                  {field.label}
                </p>
                <Form
                  value={(current as FormValue) ?? {}}
                  schema={field.fields}
                  onChange={(v) => set(field.key, v)}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
