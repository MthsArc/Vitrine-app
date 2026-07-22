"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Loja {
  id?: string;
  nome: string;
  slug: string;
  descricao: string;
  whatsapp: string;
  cor_primaria: string;
  cor_secundaria: string;
}

export default function LojaForm({ loja }: { loja: Loja | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Loja>(
    loja ?? {
      nome: "",
      slug: "",
      descricao: "",
      whatsapp: "",
      cor_primaria: "#0A0A0B",
      cor_secundaria: "#B8923D",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const update = (field: keyof Loja, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sessão expirada, faça login novamente.");
      setLoading(false);
      return;
    }

    const payload = { ...form, user_id: user.id };
    const { error } = loja?.id
      ? await supabase.from("lojas").update(payload).eq("id", loja.id)
      : await supabase.from("lojas").insert(payload);

    setLoading(false);
    if (error) {
      setError(
        error.message.includes("duplicate")
          ? "Esse endereço já está em uso, escolha outro."
          : error.message
      );
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <label className="block text-sm font-medium">Nome da loja</label>
      <input
        required
        value={form.nome}
        onChange={(e) => update("nome", e.target.value)}
        className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />

      <label className="block mt-4 text-sm font-medium">
        Endereço da loja
      </label>
      <div className="mt-1 flex items-center border border-line rounded-lg overflow-hidden">
        <span className="pl-3 text-sm text-ink/40 shrink-0">vitrine.app/</span>
        <input
          required
          pattern="[a-z0-9-]+"
          title="Só letras minúsculas, números e hífen"
          value={form.slug}
          onChange={(e) => update("slug", e.target.value.toLowerCase())}
          className="w-full py-2 pr-3 text-sm focus:outline-none"
        />
      </div>

      <label className="block mt-4 text-sm font-medium">Descrição curta</label>
      <textarea
        rows={3}
        value={form.descricao}
        onChange={(e) => update("descricao", e.target.value)}
        className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />

      <label className="block mt-4 text-sm font-medium">
        WhatsApp (com DDD, só números)
      </label>
      <input
        required
        value={form.whatsapp}
        onChange={(e) => update("whatsapp", e.target.value.replace(/\D/g, ""))}
        placeholder="5534998683464"
        className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />

      <div className="mt-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Cor principal</label>
          <input
            type="color"
            value={form.cor_primaria}
            onChange={(e) => update("cor_primaria", e.target.value)}
            className="mt-1 w-full h-10 border border-line rounded-lg"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Cor secundária</label>
          <input
            type="color"
            value={form.cor_secundaria}
            onChange={(e) => update("cor_secundaria", e.target.value)}
            className="mt-1 w-full h-10 border border-line rounded-lg"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="mt-3 text-sm text-green-700">Loja salva com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar loja"}
      </button>
    </form>
  );
}
