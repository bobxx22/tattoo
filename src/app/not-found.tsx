import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 pt-16 text-center">
        <p className="label text-muted">Помилка 404</p>
        <h1 className="mt-6 text-[clamp(3rem,10vw,8rem)] leading-none font-light tracking-[-0.05em]">Сторінки немає</h1>
        <Link
          href="/"
          className="label mt-10 border border-foreground px-6 py-4 transition hover:bg-foreground hover:text-background"
        >
          На головну
        </Link>
      </main>
    </>
  );
}
