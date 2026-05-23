"use client";

import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ContactProps } from "@/features/builder/state/types";

export default function ContactRender({ props }: { props: ContactProps }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم إرسال رسالتك بنجاح");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section className="bg-white px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <MessageCircle size={22} />
            </span>
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-base text-stone-500">
                {props.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
          {/* Info column — icon tiles with hover lift */}
          <div className="space-y-3">
            {props.email && (
              <InfoTile
                icon={<Mail size={18} />}
                tone="amber"
                label="البريد الإلكتروني"
                value={props.email}
                href={`mailto:${props.email}`}
              />
            )}
            {props.phone && (
              <InfoTile
                icon={<Phone size={18} />}
                tone="emerald"
                label="الهاتف"
                value={props.phone}
                href={`tel:${props.phone}`}
              />
            )}
            {props.address && (
              <InfoTile
                icon={<MapPin size={18} />}
                tone="sky"
                label="العنوان"
                value={props.address}
              />
            )}
          </div>

          {/* Form column */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-3xl border border-stone-200 bg-white p-7 shadow-[0_2px_20px_rgb(0,0,0,0.04)]"
          >
            <p className="mb-4 text-sm font-bold text-stone-900">
              أرسل لنا رسالة
            </p>
            <Field
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={setName}
              required
            />
            <Field
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              placeholder="رسالتك"
              value={message}
              onChange={setMessage}
              required
              textarea
            />
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-dark to-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
            >
              إرسال الرسالة
              <Send
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

const TONES = {
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  sky: { bg: "bg-sky-50", icon: "text-sky-600" },
} as const;

function InfoTile({
  icon,
  tone,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  href?: string;
}) {
  const t = TONES[tone];
  const inner = (
    <>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${t.bg} ${t.icon}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-stone-900 group-hover:text-brand-dark">
          {value}
        </p>
      </div>
    </>
  );
  const className =
    "group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md";
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}

function Field({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  textarea,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  const base =
    "block w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand focus:bg-white focus:outline focus:outline-2 focus:outline-brand/30 transition-colors";
  if (textarea) {
    return (
      <textarea
        value={value}
        rows={4}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} py-2.5`}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} h-11`}
    />
  );
}
