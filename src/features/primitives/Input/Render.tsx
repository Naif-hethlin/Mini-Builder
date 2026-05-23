"use client";

import { useState } from "react";
import type { InputPrimitiveProps } from "../types";

/**
 * Input primitive — labeled text / email / tel / number / textarea field.
 * Holds its own local state; wiring up real submission is the
 * responsibility of whatever parent (Booking section, Contact section,
 * future Form primitive) collects it.
 */
export default function InputRender({
  props,
}: {
  props: InputPrimitiveProps;
}) {
  const [value, setValue] = useState("");

  const sharedClass =
    "w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30";

  return (
    <label className="block w-full text-start">
      {props.label && (
        <span className="mb-1 block text-xs font-medium text-stone-700">
          {props.label}
          {props.required && (
            <span className="ms-1 text-rose-500" aria-hidden>
              *
            </span>
          )}
        </span>
      )}
      {props.fieldType === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          rows={3}
          className={sharedClass}
        />
      ) : (
        <input
          type={props.fieldType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={props.placeholder}
          required={props.required}
          className={sharedClass}
        />
      )}
    </label>
  );
}
