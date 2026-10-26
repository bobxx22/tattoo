// Приймає заявку з форми, перевіряє її ще раз (браузеру не довіряємо) і надсилає адмінам у Telegram.

import {
  BODY_TYPES,
  formatDay,
  formatPhone,
  isAvailableDay,
  isValidInstagram,
  isValidPhone,
  LIMITS,
  normalizeInstagram,
  normalizePhone,
} from "@/lib/booking";
import { escapeHtml, isConfigured, notifyAdmins } from "@/lib/telegram";

// Простий захист від спаму: не більше 5 заявок за 10 хвилин з однієї адреси.
// Лічильник живе в пам'яті сервера — для сайту-візитки цього достатньо.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Не вдалося прочитати заявку." }, { status: 400 });
  }

  // бот заповнив приховане поле — робимо вигляд, що все добре, і нічого не надсилаємо
  if (text(form, "company")) return Response.json({ ok: true });

  const day = text(form, "day");
  const phone = normalizePhone(text(form, "phone"));
  const name = text(form, "name").slice(0, LIMITS.name);
  const instagram = normalizeInstagram(text(form, "instagram"));
  const adult = text(form, "adult") === "yes";
  const body = text(form, "body");
  const idea = text(form, "idea").slice(0, LIMITS.idea);
  const files = form.getAll("examples").filter((f): f is File => f instanceof File && f.size > 0);

  const errors: Record<string, string> = {};
  if (!isAvailableDay(day)) errors.day = "Цей день уже недоступний — оберіть інший";
  if (!isValidPhone(phone)) errors.phone = "Невірний номер телефону";
  if (name.length < 2) errors.name = "Вкажіть ім'я";
  if (!isValidInstagram(instagram)) errors.instagram = "Невірний нік Instagram";
  if (!adult) errors.adult = "Запис доступний лише з 18 років";
  if (!(BODY_TYPES as readonly string[]).includes(body)) errors.body = "Оберіть варіант";
  if (files.length > LIMITS.files) errors.files = `Не більше ${LIMITS.files} фото`;
  else if (files.some((f) => f.size > LIMITS.fileBytes)) errors.files = "Кожне фото — до 10 МБ";
  else if (files.some((f) => f.type && !f.type.startsWith("image/"))) errors.files = "Підходять лише фото";

  if (Object.keys(errors).length) {
    return Response.json({ error: "Перевірте поля форми.", errors }, { status: 400 });
  }

  // ліміт рахуємо лише для заповнених заявок: людина, що помилилась у формі, не блокується
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) {
    return Response.json({ error: "Забагато заявок. Спробуйте трохи пізніше." }, { status: 429 });
  }

  if (!isConfigured()) {
    console.error("[booking] не задано TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_IDS у .env");
    return Response.json({ error: "Запис тимчасово недоступний. Зателефонуйте нам, будь ласка." }, { status: 503 });
  }

  const instagramLine = instagram
    ? `<a href="https://instagram.com/${instagram}">@${escapeHtml(instagram)}</a>`
    : "—";

  const message = [
    "<b>🖋 Нова заявка на сеанс</b>",
    "",
    `<b>Дата:</b> ${formatDay(day).long}`,
    `<b>Ім'я:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> +380 ${formatPhone(phone)}`,
    `<b>Instagram:</b> ${instagramLine}`,
    `<b>Статура:</b> ${body}`,
    "<b>18+:</b> підтверджено",
    "",
    "<b>Ідея:</b>",
    idea ? escapeHtml(idea) : "—",
    "",
    files.length ? `<i>Фото-приклади: ${files.length} (нижче)</i>` : "<i>Без фото-прикладів</i>",
  ].join("\n");

  const photos = files.map((f, i) => ({ name: f.name || `example-${i + 1}.jpg`, type: f.type, data: f as Blob }));
  const { delivered } = await notifyAdmins(message, photos, `Приклади від ${name}, +380 ${formatPhone(phone)}`);

  if (!delivered) {
    return Response.json({ error: "Не вдалося відправити заявку. Зателефонуйте нам, будь ласка." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
