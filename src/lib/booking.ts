// Правила запису — спільні для форми (браузер) і для сервера, щоб перевірка була однакова.

import { site } from "@/data/site";

const TZ = "Europe/Kyiv";
const { minDaysAhead, maxDaysAhead, workDays } = site.booking;

// Сьогоднішня дата за Києвом у форматі YYYY-MM-DD
export function todayInKyiv(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

// Дати рахуємо «по календарю», без годин: працюємо з полуднем UTC, щоб не з'їжджати через часові пояси
const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};
// 1 = понеділок … 7 = неділя
const weekday = (iso: string) => toDate(iso).getUTCDay() || 7;

// Дні, на які можна записатися
export function availableDays(today = todayInKyiv()) {
  const days: string[] = [];
  for (let i = minDaysAhead; i <= maxDaysAhead; i++) {
    const day = addDays(today, i);
    if (workDays.includes(weekday(day))) days.push(day);
  }
  return days;
}

export function isAvailableDay(day: string, today = todayInKyiv()) {
  return availableDays(today).includes(day);
}

const WEEKDAYS = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const WEEKDAYS_FULL = ["", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"];
const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

export const formatDay = (iso: string) => {
  const d = toDate(iso);
  return {
    weekday: WEEKDAYS[weekday(iso)],
    day: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()],
    long: `${WEEKDAYS_FULL[weekday(iso)]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
  };
};

// ---------- телефон ----------

// Приймаємо «067…», «+38067…», «380…» або 9 цифр; повертаємо 9 цифр після +380
export function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("380")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

// Коди мобільних операторів України
const OPERATORS = ["39", "50", "63", "66", "67", "68", "73", "75", "77", "91", "92", "93", "94", "95", "96", "97", "98", "99"];

export const isValidPhone = (nine: string) => /^\d{9}$/.test(nine) && OPERATORS.includes(nine.slice(0, 2));

// 671234567 → 67 123 45 67
export const formatPhone = (nine: string) =>
  [nine.slice(0, 2), nine.slice(2, 5), nine.slice(5, 7), nine.slice(7, 9)].filter(Boolean).join(" ");

// ---------- Instagram ----------

// «@name», «name» або посилання → «name»
export function normalizeInstagram(input: string) {
  const v = input.trim();
  if (!v) return "";
  const fromUrl = v.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return (fromUrl ? fromUrl[1] : v.replace(/^@/, "")).slice(0, 30);
}

export const isValidInstagram = (name: string) => name === "" || /^[A-Za-z0-9._]{1,30}$/.test(name);

export const BODY_TYPES = ["Чоловіча", "Жіноча"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const LIMITS = {
  name: 60,
  idea: 1500,
  files: site.booking.maxFiles,
  fileBytes: site.booking.maxFileMb * 1024 * 1024,
};
