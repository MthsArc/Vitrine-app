"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Categoria {
  id: string;
  nome: string;
}

export default function CategoriasManager({
  lojaId,
  categorias,
}: {
  lojaId: string;
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase
      .from("categorias")
      .insert({ loja_id: lojaId, nome: nome.trim() });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNome("");
    router.refresh();
  };

  const remover = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div>
      {categorias.length === 0 ? (
        <p className="text-sm text-ink/50">
          Nenhuma categoria ainda — crie a primeira abaixo.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-2 border border-line rounded-full pl-3 pr-2 py-1.5 text-sm"
            >
              {cat.nome}
              <button
                onClick={() => remover(cat.id)}
                aria-label={`Remover ${cat.nome}`}
                className="text-ink/40 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionar} className="mt-4 flex gap-2 max-w-sm">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da categoria"
          className="flex-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1 bg-accent text-white text-sm font-medium px-3 rounded-lg hover:bg-accent-dark disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
