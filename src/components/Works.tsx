"use client";

import { useEffect, useState } from "react";
import { styles, type Style, type Work } from "@/data/site";
import { ChevronLeft, ChevronRight, Close } from "./icons";

export function Works({ works }: { works: Work[] }) {
  const [filter, setFilter] = useState<Style | "Усі">("Усі");
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter === "Усі" ? works : works.filter((w) => w.style === filter);

  return (
    <section id="works" className="border-t border-line">
      <div className="px-4 pt-20 pb-10 text-center sm:px-6 sm:pt-28">
        <p className="label text-muted">Портфоліо ↘</p>
        <h2 className="mt-6 text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-light tracking-[-0.05em]">
          Роботи
          <br />
          майстра
        </h2>
      </div>

      {/* фільтр за стилем */}
      <div className="no-scrollbar flex gap-px overflow-x-auto border-y border-line bg-line">
        {(["Усі", ...styles] as const).map((s) => {
          const count = s === "Усі" ? works.length : works.filter((w) => w.style === s).length;
          const on = s === filter;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`label flex flex-1 shrink-0 items-center justify-center gap-2 px-5 py-4 transition ${
                on ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
              }`}
            >
              {s}
              <span className={on ? "text-background/50" : "text-muted/60"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3">
        {shown.map((work, i) => (
          <button
            key={work.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Відкрити роботу «${work.title}»`}
            className="group relative aspect-[3/4] overflow-hidden bg-background text-left"
          >
            {work.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.image}
                alt={`${work.title} — ${work.style}, ${work.placement}`}
                loading="lazy"
                className="size-full object-cover grayscale transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="placeholder flex size-full items-center justify-center">
                <span className="label text-muted/50">Фото {work.id}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent p-3 pt-12 sm:p-5 sm:pt-16">
              <span className="text-lg leading-tight font-medium sm:text-2xl">{work.title}</span>
              <span className="label hidden text-muted sm:block">{work.style}</span>
            </div>
          </button>
        ))}
      </div>

      {open !== null && <Lightbox works={shown} index={open} onIndex={setOpen} />}
    </section>
  );
}

function Lightbox({ works, index, onIndex }: { works: Work[]; index: number; onIndex: (i: number | null) => void }) {
  const work = works[index];
  const go = (d: number) => onIndex((index + d + works.length) % works.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") onIndex((index + 1) % works.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + works.length) % works.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, works.length, onIndex]);

  return (
    <div role="dialog" aria-modal="true" aria-label={work.title} className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
        <span className="label text-muted">
          {String(index + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => onIndex(null)} aria-label="Закрити" className="flex size-10 items-center justify-center">
          <Close />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
        {work.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={work.image} alt={work.title} className="max-h-full max-w-full object-contain grayscale" />
        ) : (
          <div className="placeholder aspect-[3/4] h-full max-w-full" />
        )}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Попередня"
          className="absolute top-1/2 left-2 flex size-12 -translate-y-1/2 items-center justify-center border border-line bg-background/70 sm:left-6"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Наступна"
          className="absolute top-1/2 right-2 flex size-12 -translate-y-1/2 items-center justify-center border border-line bg-background/70 sm:right-6"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-3 border-t border-line">
        {[
          ["Назва", work.title],
          ["Стиль", work.style],
          ["Місце", work.placement],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-line p-4 last:border-r-0 sm:px-6">
            <div className="label text-muted">{k}</div>
            <div className="mt-1 text-lg">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
