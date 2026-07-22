import Link from "next/link";
import { Store } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold tracking-tight">Vitrine.app</span>
          <Link
            href="/login"
            className="text-sm font-medium text-ink/70 hover:text-ink"
          >
            Entrar
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center mb-6">
          <Store size={22} className="text-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-xl">
          Sua loja online, pronta em minutos.
        </h1>
        <p className="mt-4 text-ink/60 max-w-md">
          Monte sua vitrine, com suas cores, seu catálogo e venda direto pelo
          WhatsApp — sem precisar programar nada.
        </p>
        <Link
          href="/cadastro"
          className="mt-8 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dark transition-colors"
        >
          Criar minha loja
        </Link>
      </section>
    </main>
  );
}
