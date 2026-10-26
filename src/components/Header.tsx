import Link from "next/link";
import { site } from "@/data/site";

const nav = [
  { href: "/#works", label: "Роботи" },
  { href: "/#master", label: "Майстер" },
  { href: "/#prices", label: "Ціни" },
  { href: "/#contacts", label: "Контакти" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-[-0.04em]">
          {site.name}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="label text-muted transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="#booking"
          className="label flex h-10 items-center border border-foreground px-4 transition hover:bg-foreground hover:text-background"
        >
          Записатися
        </a>
      </div>
    </header>
  );
}
