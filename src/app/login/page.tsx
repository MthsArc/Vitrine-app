"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/painel");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-line rounded-xl p-8"
      >
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink/60">Acesse o painel da sua loja.</p>

        <label className="block mt-6 text-sm font-medium">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />

        <label className="block mt-4 text-sm font-medium">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-accent text-white text-sm font-medium py-2.5 rounded-lg hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-sm text-center text-ink/60">
          Ainda não tem loja?{" "}
          <Link href="/cadastro" className="text-accent underline">
            Criar conta
          </Link>
        </p>
      </form>
    </main>
  );
}
