"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Conta criada!</h1>
          <p className="mt-2 text-sm text-ink/60">
            Se a confirmação de e-mail estiver ativa no seu projeto Supabase,
            confira sua caixa de entrada. Caso contrário, já pode{" "}
            <Link href="/login" className="text-accent underline">
              entrar
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-line rounded-xl p-8"
      >
        <h1 className="text-xl font-semibold">Criar sua loja</h1>
        <p className="mt-1 text-sm text-ink/60">
          Comece com seu e-mail e uma senha.
        </p>

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
          minLength={6}
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
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="mt-4 text-sm text-center text-ink/60">
          Já tem loja?{" "}
          <Link href="/login" className="text-accent underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
