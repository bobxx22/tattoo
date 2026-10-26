// Відправка заявок у Telegram. Без бази даних: заявка живе лише в чатах адміністраторів.
// Налаштування — у файлі .env (див. .env.example).

import "server-only";

type Photo = { name: string; type: string; data: Blob };

const token = () => process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";

// «111, 222;333» → ["111", "222", "333"]; id груп починаються з мінуса — теж підходять
export const adminChatIds = () =>
  (process.env.TELEGRAM_CHAT_IDS ?? "")
    .split(/[\s,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);

export const isConfigured = () => token() !== "" && adminChatIds().length > 0;

// TELEGRAM_API_URL потрібен лише для локальних тестів (підставний сервер); у роботі його не задають
const api = (method: string) => `${process.env.TELEGRAM_API_URL ?? "https://api.telegram.org"}/bot${token()}/${method}`;

async function call(method: string, body: FormData | Record<string, unknown>) {
  const isForm = body instanceof FormData;
  const res = await fetch(api(method), {
    method: "POST",
    headers: isForm ? undefined : { "content-type": "application/json" },
    body: isForm ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !json.ok) throw new Error(`${method}: ${json.description ?? res.status}`);
}

// Фото надсилаємо альбомом; якщо Telegram не прийняв їх як фото (рідкісний формат) — файлами
async function sendPhotos(chatId: string, photos: Photo[], caption: string) {
  const build = (kind: "photo" | "document") => {
    const form = new FormData();
    form.set("chat_id", chatId);
    if (photos.length === 1) {
      form.set(kind, photos[0].data, photos[0].name);
      form.set("caption", caption);
      return form;
    }
    form.set(
      "media",
      JSON.stringify(photos.map((_, i) => ({ type: kind, media: `attach://file${i}`, ...(i === 0 ? { caption } : {}) }))),
    );
    photos.forEach((p, i) => form.set(`file${i}`, p.data, p.name));
    return form;
  };
  const method = (kind: "photo" | "document") =>
    photos.length === 1 ? (kind === "photo" ? "sendPhoto" : "sendDocument") : "sendMediaGroup";

  try {
    await call(method("photo"), build("photo"));
  } catch {
    await call(method("document"), build("document"));
  }
}

// Розсилаємо всім адмінам паралельно. Вважаємо успіхом, якщо отримав хоча б один.
export async function notifyAdmins(text: string, photos: Photo[], photosCaption: string) {
  const results = await Promise.allSettled(
    adminChatIds().map(async (chatId) => {
      await call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
      if (photos.length) await sendPhotos(chatId, photos, photosCaption);
    }),
  );
  const failed = results.flatMap((r, i) => (r.status === "rejected" ? [`${adminChatIds()[i]}: ${String(r.reason)}`] : []));
  if (failed.length) console.error("[telegram] не доставлено:", failed.join(" | "));
  return { delivered: results.length - failed.length, failed: failed.length };
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
