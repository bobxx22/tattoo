import { BookingForm } from "@/components/BookingForm";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Works } from "@/components/Works";
import { instagramUrl, phoneHref, site, telegramUrl } from "@/data/site";

export default function Home() {
  const { master } = site;

  return (
    <>
      <Header />

      <main>
        <Hero />

        {/* Інтро */}
        <section className="grid gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[22rem_1fr]">
          <p className="label">
            Чорно-біле
            <br />
            татуювання {site.cityIn}
          </p>
          <p className="indent-[12vw] text-[clamp(1.75rem,4vw,3.75rem)] leading-[1.08] font-light tracking-[-0.03em] text-balance lg:indent-[8vw]">
            {site.intro}
          </p>
        </section>

        <Works works={site.works} />

        {/* Майстер */}
        <section id="master" className="grid border-t border-line lg:grid-cols-2">
          <div className="relative aspect-[3/4] border-line lg:aspect-auto lg:min-h-[44rem] lg:border-r">
            {master.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={master.photo} alt={`Майстер ${master.name}`} className="absolute inset-0 size-full object-cover grayscale" />
            ) : (
              <div className="placeholder absolute inset-0" />
            )}
          </div>
          <div className="flex flex-col px-4 py-16 sm:px-6 lg:p-12">
            <p className="label text-muted">Про майстра ↘</p>
            <h2 className="mt-6 text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-light tracking-[-0.05em]">{master.name}</h2>
            <p className="mt-2 text-xl text-muted">{master.role}</p>
            <p className="mt-10 max-w-xl text-xl leading-relaxed">{master.bio}</p>

            <dl className="mt-12 grid grid-cols-2 border-t border-line lg:mt-auto">
              <div className="border-r border-line py-6 pr-4">
                <dt className="label text-muted">Досвід</dt>
                <dd className="mt-2 text-5xl font-light tracking-tight">{master.years} років</dd>
              </div>
              <div className="py-6 pl-4 sm:pl-6">
                <dt className="label text-muted">Робіт</dt>
                <dd className="mt-2 text-5xl font-light tracking-tight">{master.works}</dd>
              </div>
            </dl>
            <a
              href="#booking"
              className="label mt-2 flex items-center justify-center border border-foreground py-5 transition hover:bg-foreground hover:text-background"
            >
              Записатися до майстра
            </a>
          </div>
        </section>

        {/* Ціни та як проходить запис */}
        <section id="prices" className="grid border-t border-line lg:grid-cols-2">
          <div className="border-line px-4 py-16 sm:px-6 lg:border-r lg:p-12">
            <p className="label text-muted">Ціни ↘</p>
            <ul className="mt-8 border-t border-line">
              {site.prices.map((p) => (
                <li key={p.title} className="flex items-baseline justify-between gap-4 border-b border-line py-6">
                  <div>
                    <div className="text-2xl font-light">{p.title}</div>
                    <div className="mt-1 text-sm text-muted">{p.text}</div>
                  </div>
                  <div className="text-right text-2xl whitespace-nowrap">{p.price}</div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">Точну вартість майстер назве після консультації та ескізу.</p>
          </div>
          <div className="px-4 py-16 sm:px-6 lg:p-12">
            <p className="label text-muted">Як проходить запис ↘</p>
            <ol className="mt-8 border-t border-line">
              {site.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[3.5rem_1fr] border-b border-line py-6">
                  <span className="label pt-2 text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="text-2xl font-light">{s.title}</div>
                    <div className="mt-1 text-muted">{s.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Запис */}
        <section id="booking" className="border-t border-line">
          <div className="px-4 pt-20 pb-12 sm:px-6 sm:pt-28">
            <p className="label text-muted">Онлайн-запис ↘</p>
            <h2 className="mt-6 text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-light tracking-[-0.05em]">
              Записатися
              <br />
              на сеанс
            </h2>
          </div>
          <BookingForm />
        </section>

        {/* Контакти */}
        <section id="contacts" className="border-t border-line">
          <div className="px-4 py-16 text-center sm:px-6 sm:py-24">
            <p className="label text-muted">Instagram ↘</p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block text-[clamp(2.25rem,7vw,6rem)] leading-none font-light tracking-[-0.04em] break-words transition hover:text-muted"
            >
              @{site.instagram}
            </a>
          </div>
          <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Адреса", v: site.address },
              { k: "Графік", v: site.hours },
              { k: "Телефон", v: site.phone, href: phoneHref },
              { k: "Telegram", v: `@${site.telegram}`, href: telegramUrl },
            ].map((c) => (
              <div key={c.k} className="border-b border-line px-4 py-6 sm:border-r sm:px-6 sm:even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0">
                <div className="label text-muted">{c.k}</div>
                {c.href ? (
                  <a href={c.href} className="mt-2 block text-xl transition hover:text-muted">
                    {c.v}
                  </a>
                ) : (
                  <div className="mt-2 text-xl">{c.v}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 pt-10 pb-6 sm:px-6">
        <div className="label flex justify-between text-muted">
          <span>{site.type}</span>
          <span>© 2026</span>
        </div>
        <div className="mt-6 text-center text-[19.5vw] leading-[0.8] font-bold tracking-[-0.06em] select-none">{site.name}</div>
      </footer>
    </>
  );
}
