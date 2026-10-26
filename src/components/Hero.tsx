import { site } from "@/data/site";
import { ArrowDown, ArrowUpRight } from "./icons";

export function Hero() {
  return (
    <section className="pt-16">
      <div className="relative h-[calc(100svh-4rem-6rem)] min-h-[440px] overflow-hidden sm:h-[calc(100svh-4rem-8.5rem)]">
        {site.hero.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.hero.image} alt="" className="absolute inset-0 size-full object-cover grayscale" />
        ) : (
          <div className="placeholder absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-6">
          <span className="label">
            {site.city}, {site.district}
          </span>
          <span className="label flex items-center gap-2">
            Гортайте <ArrowDown className="size-3.5" />
          </span>
        </div>
      </div>

      {/* велика смуга-кнопка, як у референсі */}
      <a href="#booking" className="group flex border-y border-line transition hover:bg-foreground hover:text-background">
        <span className="flex flex-1 items-center px-4 text-[13vw] leading-none font-light tracking-[-0.05em] sm:px-6 sm:text-[clamp(3rem,7.5vw,8rem)]">
          <span className="py-5 sm:py-6">Запис на сеанс</span>
        </span>
        <span className="flex w-24 shrink-0 items-center justify-center border-l border-line transition group-hover:border-background/20 sm:w-[8.5rem]">
          <ArrowUpRight className="size-9 transition group-hover:translate-x-1 group-hover:-translate-y-1 sm:size-12" />
        </span>
      </a>
    </section>
  );
}
