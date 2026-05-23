"use client";

import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    <section className="bg-stone-50 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
          <div className="grid lg:grid-cols-[5fr_7fr]">
            {/* ── Left: brand panel with eyebrow / title / contact tiles ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-soft p-8 text-white sm:p-10">
              {/* Decorative blob behind the content */}
              <div
                aria-hidden
                className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 start-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles size={12} />
                  تواصل معنا
                </span>

                {props.title && (
                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                    {props.title}
                  </h2>
                )}
                {props.subtitle && (
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/90">
                    {props.subtitle}
                  </p>
                )}

                {/* Trust signals */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <TrustChip icon={<Clock size={11} />} label="نرد خلال ساعة" />
                  <TrustChip
                    icon={<ShieldCheck size={11} />}
                    label="بياناتك محفوظة"
                  />
                </div>

                {/* Contact channels */}
                <div className="mt-8 space-y-2">
                  {props.email && (
                    <ChannelLink
                      icon={<Mail size={16} />}
                      label="البريد"
                      value={props.email}
                      href={`mailto:${props.email}`}
                    />
                  )}
                  {props.phone && (
                    <ChannelLink
                      icon={<Phone size={16} />}
                      label="الهاتف"
                      value={props.phone}
                      href={`tel:${props.phone}`}
                    />
                  )}
                  {props.address && (
                    <ChannelLink
                      icon={<MapPin size={16} />}
                      label="العنوان"
                      value={props.address}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: form ── */}
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <p className="text-base font-bold text-stone-900">
                    أرسل لنا رسالة
                  </p>
                  <p className="text-xs text-stone-500">
                    سنرد عليك في أقرب وقت ممكن
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <FloatingField
                  label="الاسم الكامل"
                  type="text"
                  value={name}
                  onChange={setName}
                  required
                />
                <FloatingField
                  label="البريد الإلكتروني"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <FloatingField
                  label="رسالتك"
                  textarea
                  value={message}
                  onChange={setMessage}
                  required
                />
              </div>

              <button
                type="submit"
                className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-dark to-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
              >
                إرسال الرسالة
                <Send
                  size={14}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </button>
              <p className="mt-3 text-center text-[11px] text-stone-400">
                بإرسالك الرسالة، فأنت توافق على شروط الاستخدام.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
      {icon}
      {label}
    </span>
  );
}

function ChannelLink({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-bold">{value}</span>
      </span>
    </>
  );
  const className =
    "group flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10";
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}

function FloatingField({
  label,
  type = "text",
  value,
  onChange,
  required,
  textarea,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  const sharedClass =
    "peer block w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 pb-2.5 pt-5 text-sm text-stone-900 placeholder-transparent focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30";

  const labelClass =
    "pointer-events-none absolute start-3.5 top-2 origin-start text-[11px] font-medium text-stone-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-brand";

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          rows={4}
          required={required}
          className={sharedClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          required={required}
          className={`${sharedClass} h-14`}
        />
      )}
      <label className={labelClass}>{label}</label>
    </div>
  );
}
