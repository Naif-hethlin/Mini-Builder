"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
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
    <section className="bg-white px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        {(props.title || props.subtitle) && (
          <div className="mb-10 text-center">
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mt-2 text-sm text-stone-500">{props.subtitle}</p>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr,1.5fr]">
          {/* Info column */}
          <div className="space-y-4 text-sm">
            {props.email && (
              <InfoRow icon={<Mail size={16} />} label="البريد">
                {props.email}
              </InfoRow>
            )}
            {props.phone && (
              <InfoRow icon={<Phone size={16} />} label="الهاتف">
                {props.phone}
              </InfoRow>
            )}
            {props.address && (
              <InfoRow icon={<MapPin size={16} />} label="العنوان">
                {props.address}
              </InfoRow>
            )}
          </div>

          {/* Form column */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-5"
          >
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
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              <Send size={14} />
              إرسال
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-brand-light text-brand">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="text-sm font-medium text-stone-900">{children}</p>
      </div>
    </div>
  );
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
    "block w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30";
  if (textarea) {
    return (
      <textarea
        value={value}
        rows={4}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} py-2`}
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
