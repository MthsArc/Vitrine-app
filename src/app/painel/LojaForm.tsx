"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, extensionOf } from "@/lib/supabase/storage";

interface Loja {
  id?: string;
  nome: string;
  slug: string;
  descricao: string;
  whatsapp: string;
  logo_url?: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  status?: string;
}

const STATUS_LABELS: Record<string, string> = {
  em_construcao: "Em construção",
  publicada: "Publicada",
  pausada: "Pausada",
};

export default function LojaForm({ loja }: { loja: Loja | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Loja>(
    loja ?? {
      nome: "",
      slug: "",
      descricao: "",
      whatsapp: "",
      logo_url: "",
      cor_primaria: "#0A0A0B",
      cor_secundaria: "#B8923D",
      status: "em_construcao",
    }
  );
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const update = (field: keyof Loja, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada, faça login novamente.");

      const path = `${user.id}/logo-${Date.now()}.${extensionOf(file)}`;
      const url = await uploadImage(file, path);
      update("logo_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar a logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

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
      <label className="block text-sm font-medium">Logo da loja</label>
      <div className="mt-1 flex items-center gap-4">
        {form.logo_url ? (
          <img
            src={form.logo_url}
            alt="Logo"
            className="w-16 h-16 rounded-lg object-cover border border-line"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-line flex items-center justify-center text-xs text-ink/30">
            sem logo
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="text-sm"
        />
      </div>
      {uploadingLogo && (
        <p className="mt-1 text-xs text-ink/50">Enviando logo...</p>
      )}

      <label className="block mt-5 text-sm font-medium">Nome da loja</label>
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
        placeholder="5534123456789"
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

      <label className="block mt-4 text-sm font-medium">Status da loja</label>
      <select
        value={form.status ?? "em_construcao"}
        onChange={(e) => update("status", e.target.value)}
        className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-ink/50">
        Só lojas com status "Publicada" vão aparecer pro público quando a
        vitrine estiver no ar.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="mt-3 text-sm text-green-700">Loja salva com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={loading || uploadingLogo}
        className="mt-6 bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar loja"}
      </button>
    </form>
  );
}
