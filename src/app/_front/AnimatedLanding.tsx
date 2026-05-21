"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/shared/ui/Logo";

const TYPEWRITER_PHRASES = [
  "موقع عملك بدون كود",
  "متجرك الإلكتروني بسهولة",
  "هويتك الرقمية في دقائق",
  "منصتك التعليمية بخطوات",
];

const HOLD_AFTER_TYPE_MS = 2000;
const HOLD_AFTER_DELETE_MS = 500;
const TYPE_SPEED_MS = 120;
const DELETE_SPEED_MS = 50;

export function AnimatedLanding() {
  const text = useTypewriter(TYPEWRITER_PHRASES);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  // Mouse-tracking parallax for the background blobs. Each blob drifts a
  // little proportional to cursor offset — same idea as the source design.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const xRatio = e.clientX / window.innerWidth;
      const yRatio = e.clientY / window.innerHeight;
      blobsRef.current.forEach((blob, i) => {
        if (!blob) return;
        const speed = (i + 1) * 10;
        blob.style.marginInlineStart = `${(0.5 - xRatio) * speed}px`;
        blob.style.marginBlockStart = `${(0.5 - yRatio) * speed}px`;
        blob.style.transition = "margin 0.3s ease-out";
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const registerBlob = (i: number) => (el: HTMLDivElement | null) => {
    if (el) blobsRef.current[i] = el;
  };

  return (
    <main className="bg-animated-gradient relative flex h-screen w-full items-center justify-center overflow-hidden text-stone-900">
      {/* ── Background blobs + accent dots ──────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          ref={registerBlob(0)}
          className="absolute -top-20 -right-20 h-96 w-96 animate-blob rounded-full bg-brand-soft opacity-20 mix-blend-multiply blur-3xl"
        />
        <div
          ref={registerBlob(1)}
          className="absolute -bottom-32 -left-20 h-80 w-80 animate-blob rounded-full bg-tint-peach opacity-50 mix-blend-multiply blur-3xl [animation-delay:2s]"
        />
        <div
          ref={registerBlob(2)}
          className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-blob rounded-full bg-white opacity-50 mix-blend-overlay blur-3xl [animation-delay:4s]"
        />

        <div className="absolute top-1/4 right-1/3 h-4 w-4 animate-float-slow rounded-full bg-brand opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 h-6 w-6 animate-float-medium rounded-full bg-brand-soft opacity-10" />
        <div className="absolute top-1/2 right-1/4 h-3 w-3 animate-float-fast rounded-full bg-brand opacity-30" />
      </div>

      {/* ── Center column ───────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        {/* Logo with morph blob behind it */}
        <Link
          href="/templates"
          className="group mb-10 flex animate-fade-in-up items-center gap-3 fade-in-start"
        >
          <div className="relative flex h-14 w-14 animate-pulse-glow items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <div
              aria-hidden
              className="absolute inset-0 animate-morph bg-brand/20"
            />
            <Logo
              variant="mark"
              height={44}
              className="relative z-10 drop-shadow-md"
            />
          </div>
          <Logo
            variant="wordmark"
            height={32}
            className="transition-opacity duration-300 group-hover:opacity-90"
          />
        </Link>

        {/* Headline + typewriter */}
        <div
          className="mb-6 flex h-[80px] w-full animate-fade-in-up items-center justify-center fade-in-start md:h-[100px] [animation-delay:100ms]"
        >
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 text-4xl leading-tight font-extrabold md:text-5xl lg:text-6xl">
            <span>أنشئ</span>
            <span className="relative flex h-full min-w-[200px] items-center">
              <span className="inline-block text-brand">{text}</span>
              <span className="ms-1 inline-block h-10 w-[3px] animate-blink bg-brand md:h-12 lg:h-14" />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-stone-600 fade-in-start [animation-delay:200ms] md:text-xl">
          قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة مشروعك — كل ذلك في
          منصة واحدة.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up fade-in-start [animation-delay:300ms]">
          <Link
            href="/templates"
            className="group inline-flex -translate-y-0 items-center gap-3 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(232,93,93,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(232,93,93,0.5)]"
          >
            <span>ابدأ الآن</span>
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* Bottom dots */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-fade-in-up gap-2 fade-in-start [animation-delay:400ms]">
          <span className="h-2 w-2 rounded-full bg-brand/30" />
          <span className="h-2 w-2 rounded-full bg-brand/50" />
          <span className="h-2 w-2 rounded-full bg-brand/30" />
        </div>
      </div>
    </main>
  );
}

// =============================================================================
// useTypewriter — cycles through `phrases`, typing + deleting each one.
// =============================================================================
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phraseIndex];
      if (deleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }
      setText(current.slice(0, charIndex));

      let delay = deleting ? DELETE_SPEED_MS : TYPE_SPEED_MS;
      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = HOLD_AFTER_TYPE_MS;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = HOLD_AFTER_DELETE_MS;
      } else if (!deleting) {
        // small human variance while typing
        delay += Math.random() * 50 - 25;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [phrases]);

  return text;
}
