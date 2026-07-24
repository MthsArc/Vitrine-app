"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, extensionOf } from "@/lib/supabase/storage";

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria_id: string | null;
  tamanhos: string | null;
  imagem_url: string | null;
  destaque: boolean;
  mais_vendido: boolean;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  oculto: "Oculto",
};

const EMPTY_FORM = {
  nome: "",
  preco: "",
  categoria_id: "",
  tamanhos: "",
  imagem_url: "",
  destaque: false,
  mais_vendido: false,
  status: "rascunho",
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosManager({
  lojaId,
  categorias,
  produtos,
}: {
  lojaId: string;
  categorias: Categoria[];
  produtos: Produto[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof EMPTY_FORM, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const nomeCategoria = (id: string | null) =>
    categorias.find((c) => c.id === id)?.nome ?? "Sem categoria";

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada, faça login novamente.");

      const path = `${user.id}/produtos/${Date.now()}.${extensionOf(file)}`;
      const url = await uploadImage(file, path);
      update("imagem_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar a foto.");
    } finally {
      setUploadingFoto(false);
    }
  };

  const startEdit = (p: Produto) => {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      preco: String(p.preco),
      categoria_id: p.categoria_id ?? "",
      tamanhos: p.tamanhos ?? "",
      imagem_url: p.imagem_url ?? "",
      destaque: p.destaque,
      mais_vendido: p.mais_vendido,
      status: p.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const payload = {
      loja_id: lojaId,
      nome: form.nome,
      preco: Number(form.preco.replace(",", ".")),
      categoria_id: form.categoria_id || null,
      tamanhos: form.tamanhos,
      imagem_url: form.imagem_url || null,
      destaque: form.destaque,
      mais_vendido: form.mais_vendido,
      status: form.status,
    };

    const { error } = editingId
      ? await supabase.from("produtos").update(payload).eq("id", editingId)
      : await supabase.from("produtos").insert(payload);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    cancelEdit();
    router.refresh();
  };

  const remover = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div>
      {produtos.length === 0 ? (
        <p className="text-sm text-ink/50">
          Nenhum produto ainda — cadastre o primeiro abaixo.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line rounded-lg">
          {produtos.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome}
                    className="w-10 h-10 rounded-md object-cover border border-line"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md border border-dashed border-line" />
                )}
                <div>
                  <p className="text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-ink/50">
                    {formatPrice(p.preco)} · {nomeCategoria(p.categoria_id)} ·{" "}
                    {STATUS_LABELS[p.status]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEdit(p)}
                  aria-label={`Editar ${p.nome}`}
                  className="text-ink/40 hover:text-accent"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remover(p.id)}
                  aria-label={`Remover ${p.nome}`}
                  className="text-ink/40 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg border border-line rounded-lg p-4"
      >
        <p className="text-sm font-semibold">
          {editingId ? "Editando produto" : "Novo produto"}
        </p>

        <label className="block mt-3 text-sm font-medium">Foto</label>
        <div className="mt-1 flex items-center gap-4">
          {form.imagem_url ? (
            <img
              src={form.imagem_url}
              alt="Produto"
              className="w-16 h-16 rounded-lg object-cover border border-line"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg border border-dashed border-line flex items-center justify-center text-xs text-ink/30">
              sem foto
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="text-sm"
          />
        </div>
        {uploadingFoto && (
          <p className="mt-1 text-xs text-ink/50">Enviando foto...</p>
        )}

        <label className="block mt-3 text-sm font-medium">Nome</label>
        <input
          required
          value={form.nome}
          onChange={(e) => update("nome", e.target.value)}
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />

        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium">Preço (R$)</label>
            <input
              required
              inputMode="decimal"
              value={form.preco}
              onChange={(e) => update("preco", e.target.value)}
              placeholder="139,90"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Categoria</label>
            <select
              value={form.categoria_id}
              onChange={(e) => update("categoria_id", e.target.value)}
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="block mt-3 text-sm font-medium">Tamanhos</label>
        <input
          value={form.tamanhos}
          onChange={(e) => update("tamanhos", e.target.value)}
          placeholder="M, G, GG"
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />

        <label className="block mt-3 text-sm font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="rascunho">Rascunho</option>
          <option value="publicado">Publicado</option>
          <option value="oculto">Oculto</option>
        </select>

        <div className="mt-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => update("destaque", e.target.checked)}
            />
            Destaque
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.mais_vendido}
              onChange={(e) => update("mais_vendido", e.target.checked)}
            />
            Mais vendido
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading || uploadingFoto}
            className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar produto"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-ink/60 hover:text-ink"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
