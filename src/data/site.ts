// Усі дані студії в одному файлі.
// Для нового клієнта міняємо цей файл і фото в public/images — решта сайту підлаштується.

export type Style = "Реалізм" | "Блекворк" | "Графіка" | "Лайнворк";

export type Work = {
  id: string;
  title: string;
  style: Style;
  placement: string; // де на тілі
  image?: string; // /images/works/....webp — поки фото немає, показуємо заглушку
};

// фото роботи за її номером: public/images/works/01.webp
const work = (id: string) => `/images/works/${id}.webp`;

export const site = {
  name: "ЧОРНИЛО",
  type: "Тату-студія",
  city: "Київ",
  cityIn: "у Києві", // для текстів: «студія у Києві»
  district: "Поділ",
  url: "https://chornylo.com.ua",

  master: {
    name: "Остап",
    role: "Тату-майстер",
    years: 9,
    works: "1500+",
    bio: "Працюю в чорно-білому: реалізм, блекворк і графіка. Кожен ескіз малюю з нуля під конкретну людину — без шаблонів і повторів. Стерильність, одноразові матеріали та чесна консультація перед сеансом.",
    photo: "/images/site/master.webp" as string | undefined,
  },

  intro:
    "Татуювання — це історія, яку ви носите на собі все життя. Ми не поспішаємо: спершу розмова та ескіз, потім сеанс, і лише коли результат влаштовує вас на сто відсотків.",

  hero: {
    image: "/images/site/hero.webp" as string | undefined,
  },

  phone: "+380 67 765 43 21",
  address: "вул. Межигірська, 12, Київ",
  instagram: "chornylo.tattoo",
  telegram: "chornylo_tattoo",

  hours: "Пн – Пт, 11:00 – 20:00",

  prices: [
    { title: "Мінітату", text: "до 5 см", price: "від 1 500 ₴" },
    { title: "Середня робота", text: "до 15 см", price: "від 3 500 ₴" },
    { title: "Сеанс", text: "великі проєкти, рукав", price: "6 000 ₴ / день" },
  ],

  steps: [
    { title: "Заявка", text: "Обираєте день і описуєте ідею. Можна додати фото-приклади." },
    { title: "Консультація", text: "Майстер пише вам, уточнює розмір, місце та бюджет." },
    { title: "Ескіз", text: "Малюємо ескіз під вас і правимо, поки він не стане ідеальним." },
    { title: "Сеанс", text: "Б'ємо татуювання і розповідаємо, як доглядати за ним." },
  ],

  works: [
    { id: "01", title: "Ворон", style: "Блекворк", placement: "Передпліччя", image: work("01") },
    { id: "02", title: "Портрет", style: "Реалізм", placement: "Плече", image: work("02") },
    { id: "03", title: "Змія і троянда", style: "Графіка", placement: "Гомілка", image: work("03") },
    { id: "04", title: "Лінія гір", style: "Лайнворк", placement: "Зап'ястя", image: work("04") },
    { id: "05", title: "Череп", style: "Реалізм", placement: "Стегно", image: work("05") },
    { id: "06", title: "Орнамент", style: "Блекворк", placement: "Спина", image: work("06") },
    { id: "07", title: "Метелик", style: "Графіка", placement: "Ключиця", image: work("07") },
    { id: "08", title: "Профіль", style: "Лайнворк", placement: "Передпліччя", image: work("08") },
    { id: "09", title: "Вовк", style: "Реалізм", placement: "Литка", image: work("09") },
    { id: "10", title: "Місяць", style: "Блекворк", placement: "Лопатка", image: work("10") },
    { id: "11", title: "Гравюра", style: "Графіка", placement: "Плече", image: work("11") },
    { id: "12", title: "Квітка", style: "Лайнворк", placement: "Ребра", image: work("12") },
  ] satisfies Work[] as Work[],

  // правила запису
  booking: {
    minDaysAhead: 3, // найраніше — через 3 дні від сьогодні
    maxDaysAhead: 14, // найпізніше — через 14 днів
    workDays: [1, 2, 3, 4, 5], // 1 = понеділок … 5 = п'ятниця; вихідні недоступні
    maxFiles: 3,
    maxFileMb: 10,
  },
};

export const styles: Style[] = ["Реалізм", "Блекворк", "Графіка", "Лайнворк"];

export const phoneHref = `tel:${site.phone.replace(/[^\d+]/g, "")}`;
export const instagramUrl = `https://instagram.com/${site.instagram}`;
export const telegramUrl = `https://t.me/${site.telegram}`;
