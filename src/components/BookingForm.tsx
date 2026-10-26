"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  availableDays,
  BODY_TYPES,
  formatDay,
  formatPhone,
  isValidInstagram,
  isValidPhone,
  LIMITS,
  normalizeInstagram,
  normalizePhone,
  todayInKyiv,
  type BodyType,
} from "@/lib/booking";
import { compressImage } from "@/lib/compress";
import { site } from "@/data/site";
import { ArrowUpRight, Check, Close, Plus } from "./icons";

type Example = { file: File; url: string };
type Errors = Partial<Record<"day" | "phone" | "name" | "instagram" | "adult" | "body" | "idea" | "files" | "form", string>>;
type Status = "idle" | "sending" | "done";

// Дати залежать від «сьогодні», тому рахуємо їх лише в браузері (на сервері сторінка зібрана заздалегідь)
const noop = () => () => {};
const useToday = () => useSyncExternalStore(noop, () => todayInKyiv(), () => "");

export function BookingForm() {
  const today = useToday();
  const days = today ? availableDays(today) : [];

  const [day, setDay] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [adult, setAdult] = useState(false);
  const [body, setBody] = useState<BodyType | "">("");
  const [idea, setIdea] = useState("");
  const [examples, setExamples] = useState<Example[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [sentDay, setSentDay] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  // прибираємо тимчасові посилання на прев'ю, коли форма зникає
  const examplesRef = useRef(examples);
  useEffect(() => {
    examplesRef.current = examples;
  }, [examples]);
  useEffect(() => () => examplesRef.current.forEach((e) => URL.revokeObjectURL(e.url)), []);

  // поле змінили — прибираємо його помилку
  const clear = (key: keyof Errors) => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!day) e.day = "Оберіть день";
    if (!isValidPhone(phone)) e.phone = "Введіть мобільний номер: +380 XX XXX XX XX";
    if (name.trim().length < 2) e.name = "Вкажіть ім'я";
    if (!isValidInstagram(normalizeInstagram(instagram))) e.instagram = "Нік у форматі @username";
    if (!adult) e.adult = "Запис доступний лише з 18 років";
    if (!body) e.body = "Оберіть варіант";
    return e;
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...examples];
    let error = "";
    for (const file of Array.from(list)) {
      if (next.length >= LIMITS.files) {
        error = `Можна додати не більше ${LIMITS.files} фото`;
        break;
      }
      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
        error = "Підходять лише фото (JPG, PNG, WEBP, HEIC)";
        continue;
      }
      if (file.size > LIMITS.fileBytes) {
        error = `«${file.name}» більший за ${site.booking.maxFileMb} МБ`;
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setExamples(next);
    setErrors((prev) => ({ ...prev, files: error || undefined }));
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(examples[i].url);
    setExamples(examples.filter((_, j) => j !== i));
    setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"]`)?.scrollIntoView({ block: "center" });
      return;
    }

    setStatus("sending");
    try {
      const data = new FormData();
      data.set("day", day);
      data.set("phone", phone);
      data.set("name", name.trim());
      data.set("instagram", normalizeInstagram(instagram));
      data.set("adult", adult ? "yes" : "");
      data.set("body", body);
      data.set("idea", idea.trim());
      data.set("company", honeypot.current?.value ?? ""); // пастка для ботів
      for (const ex of await Promise.all(examples.map((e) => compressImage(e.file)))) data.append("examples", ex);

      const res = await fetch("/api/booking", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ ...(json.errors ?? {}), form: json.error ?? "Не вдалося відправити заявку. Спробуйте ще раз або напишіть нам." });
        setStatus("idle");
        return;
      }
      examples.forEach((ex) => URL.revokeObjectURL(ex.url));
      setSentDay(day);
      setStatus("done");
    } catch {
      setErrors({ form: "Немає з'єднання з інтернетом. Перевірте мережу і спробуйте ще раз." });
      setStatus("idle");
    }
  };

  const reset = () => {
    setDay("");
    setPhone("");
    setName("");
    setInstagram("");
    setAdult(false);
    setBody("");
    setIdea("");
    setExamples([]);
    setErrors({});
    setStatus("idle");
  };

  if (status === "done") {
    return (
      <div className="border-t border-line px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center border border-foreground">
            <Check className="size-7" />
          </div>
          <h3 className="mt-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-light tracking-[-0.04em]">Заявку прийнято</h3>
          <p className="mt-6 text-lg text-muted">
            Бажаний день — <span className="text-foreground">{formatDay(sentDay).long}</span>.
            <br />
            Майстер зв&apos;яжеться з вами, щоб узгодити час і деталі.
          </p>
          <button type="button" onClick={reset} className="label mt-10 border border-line px-6 py-4 transition hover:border-foreground">
            Нова заявка
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="border-t border-line">
      {/* 01 — день */}
      <Row index="01" title="День" hint={`Пн – Пт, від ${site.booking.minDaysAhead} до ${site.booking.maxDaysAhead} днів наперед`}>
        <div data-field="day">
          <div className="grid grid-cols-3 gap-px border border-line bg-line sm:grid-cols-5">
            {today
              ? days.map((d) => {
                  const f = formatDay(d);
                  const on = d === day;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDay(d);
                        clear("day");
                      }}
                      aria-pressed={on}
                      className={`flex flex-col items-start gap-1 p-4 text-left transition ${
                        on ? "bg-foreground text-background" : "bg-background hover:bg-surface"
                      }`}
                    >
                      <span className={`label ${on ? "text-background/60" : "text-muted"}`}>{f.weekday}</span>
                      <span className="text-3xl leading-none font-light tracking-tight">{f.day}</span>
                      <span className={`text-sm ${on ? "text-background/70" : "text-muted"}`}>{f.month}</span>
                    </button>
                  );
                })
              : Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-[6.5rem] bg-background" />)}
            {/* добиваємо останній ряд порожніми клітинками: 3 колонки на телефоні, 5 на комп'ютері */}
            {today &&
              Array.from({ length: 4 }).map((_, i) => {
                const pad3 = (3 - (days.length % 3)) % 3;
                const pad5 = (5 - (days.length % 5)) % 5;
                if (i >= Math.max(pad3, pad5)) return null;
                return (
                  <div
                    key={`pad${i}`}
                    aria-hidden
                    className={`bg-background ${i < pad3 ? "block" : "hidden"} ${i < pad5 ? "sm:block" : "sm:hidden"}`}
                  />
                );
              })}
          </div>
          <FieldError text={errors.day} />
          <p className="mt-3 text-sm text-muted">Точний час майстер узгодить з вами особисто.</p>
        </div>
      </Row>

      {/* 02 — контакти */}
      <Row index="02" title="Контакти">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Телефон" required error={errors.phone} name="phone">
            <div className="flex items-baseline border-b border-line focus-within:border-foreground">
              <span className="py-3 pr-2 text-xl text-muted">+380</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="67 123 45 67"
                value={formatPhone(phone)}
                onChange={(e) => {
                  setPhone(normalizePhone(e.target.value).slice(0, 9));
                  clear("phone");
                }}
                className="min-w-0 flex-1 bg-transparent py-3 text-xl outline-none placeholder:text-muted/40"
              />
            </div>
          </Field>
          <Field label="Ім'я" required error={errors.name} name="name">
            <input
              type="text"
              autoComplete="given-name"
              placeholder="Як до вас звертатися"
              maxLength={LIMITS.name}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clear("name");
              }}
              className="w-full border-b border-line bg-transparent py-3 text-xl outline-none placeholder:text-muted/40 focus:border-foreground"
            />
          </Field>
          <Field label="Instagram" error={errors.instagram} name="instagram">
            <div className="flex items-baseline border-b border-line focus-within:border-foreground">
              <span className="py-3 pr-1 text-xl text-muted">@</span>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="username"
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value);
                  clear("instagram");
                }}
                className="min-w-0 flex-1 bg-transparent py-3 text-xl outline-none placeholder:text-muted/40"
              />
            </div>
          </Field>
          <Field label="Статура" required error={errors.body} name="body">
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {BODY_TYPES.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={body === b}
                  onClick={() => {
                    setBody(b);
                    clear("body");
                  }}
                  className={`py-3.5 text-lg transition ${body === b ? "bg-foreground text-background" : "bg-background hover:bg-surface"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <label data-field="adult" className="mt-10 flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => {
              setAdult(e.target.checked);
              clear("adult");
            }}
            className="peer sr-only"
          />
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center border border-muted transition peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
            {adult && <Check />}
          </span>
          <span className="text-lg">
            Мені виповнилося 18 років <span className="text-muted">*</span>
            <span className="block text-sm text-muted">Татуювання робимо лише повнолітнім, на сеансі попросимо документ.</span>
          </span>
        </label>
        <FieldError text={errors.adult} />
      </Row>

      {/* 03 — ідея */}
      <Row index="03" title="Ідея" hint="Необов'язково, але дуже допоможе майстру">
        <Field label="Опишіть ідею" error={errors.idea} name="idea">
          <textarea
            rows={4}
            maxLength={LIMITS.idea}
            placeholder="Що хочете зобразити, розмір, місце на тілі, кольорова чи ні…"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full resize-y border-b border-line bg-transparent py-3 text-xl outline-none placeholder:text-muted/40 focus:border-foreground"
          />
        </Field>

        <div data-field="files" className="mt-10">
          <div className="label flex justify-between text-muted">
            <span>Приклади того, що хочете</span>
            <span>
              {examples.length} / {LIMITS.files} · до {site.booking.maxFileMb} МБ
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line">
            {examples.map((ex, i) => (
              <div key={ex.url} className="relative aspect-square bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ex.url} alt={`Приклад ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Прибрати приклад ${i + 1}`}
                  className="absolute top-2 right-2 flex size-9 items-center justify-center bg-background/80 transition hover:bg-foreground hover:text-background"
                >
                  <Close className="size-5" />
                </button>
              </div>
            ))}
            {examples.length < LIMITS.files && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-3 bg-background text-muted transition hover:bg-surface hover:text-foreground"
              >
                <Plus className="size-7" />
                <span className="label">Додати фото</span>
              </button>
            )}
            {/* порожні клітинки, щоб сітка лишалась рівною */}
            {Array.from({ length: Math.max(0, LIMITS.files - examples.length - 1) }).map((_, i) => (
              <div key={i} className="aspect-square bg-background" />
            ))}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <FieldError text={errors.files} />
        </div>
      </Row>

      {/* пастка для ботів: людина цього поля не бачить */}
      <input ref={honeypot} name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="border-t border-line">
        {errors.form && <p className="border-b border-line px-4 py-4 text-danger sm:px-6">{errors.form}</p>}
        <button
          type="submit"
          disabled={status === "sending"}
          className="group flex w-full text-left transition hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-60"
        >
          <span className="flex-1 px-4 py-6 text-[clamp(2.25rem,6vw,5.5rem)] leading-none font-light tracking-[-0.05em] sm:px-6">
            {status === "sending" ? "Відправляємо…" : "Відправити заявку"}
          </span>
          <span className="flex w-24 shrink-0 items-center justify-center border-l border-line sm:w-[8.5rem]">
            <ArrowUpRight className="size-9 transition group-hover:translate-x-1 group-hover:-translate-y-1 sm:size-12" />
          </span>
        </button>
        <p className="border-t border-line px-4 py-4 text-sm text-muted sm:px-6">
          Поля з * обов&apos;язкові. Надсилаючи заявку, ви погоджуєтесь, що майстер зв&apos;яжеться з вами за вказаними контактами.
        </p>
      </div>
    </form>
  );
}

function Row({ index, title, hint, children }: { index: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid border-b border-line last:border-b-0 lg:grid-cols-[22rem_1fr]">
      <div className="border-line px-4 pt-10 sm:px-6 lg:border-r lg:py-12">
        <div className="label text-muted">{index}</div>
        <h3 className="mt-2 text-3xl font-light tracking-tight">{title}</h3>
        {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      </div>
      <div className="px-4 pt-6 pb-10 sm:px-6 lg:py-12">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  name,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div data-field={name}>
      <div className="label text-muted">
        {label}
        {required && " *"}
      </div>
      <div className="mt-1">{children}</div>
      <FieldError text={error} />
    </div>
  );
}

const FieldError = ({ text }: { text?: string }) =>
  text ? <p className="mt-2 text-sm text-danger">{text}</p> : null;
