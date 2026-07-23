import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import LojaForm from "./LojaForm";
import CategoriasManager from "./CategoriasManager";
import ProdutosManager from "./ProdutosManager";

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: loja } = await supabase
    .from("lojas")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  const { data: categorias } = loja
    ? await supabase
        .from("categorias")
        .select("id, nome")
        .eq("loja_id", loja.id)
        .order("created_at")
    : { data: [] };

  const { data: produtos } = loja
    ? await supabase
        .from("produtos")
        .select("id, nome, preco, categoria_id, tamanhos, destaque, mais_vendido, status")
        .eq("loja_id", loja.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold tracking-tight">Vitrine.app</span>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold">
          {loja ? "Sua loja" : "Vamos criar sua loja"}
        </h1>
        <p className="mt-2 text-ink/60">
          Logado como <span className="font-medium text-ink">{user?.email}</span>
        </p>

        <div className="mt-8">
          <LojaForm loja={loja} />
        </div>

        {loja && (
          <>
            <div className="mt-14 pt-10 border-t border-line max-w-lg">
              <h2 className="text-lg font-semibold">Categorias</h2>
              <p className="mt-1 text-sm text-ink/60">
                Organize seus produtos em categorias — do jeito que fizer
                sentido pro seu negócio.
              </p>
              <div className="mt-5">
                <CategoriasManager
                  lojaId={loja.id}
                  categorias={categorias ?? []}
                />
              </div>
            </div>

            <div className="mt-14 pt-10 border-t border-line max-w-lg">
              <h2 className="text-lg font-semibold">Produtos</h2>
              <p className="mt-1 text-sm text-ink/60">
                Cadastre os produtos da sua loja. Foto ainda não disponível
                nesta etapa.
              </p>
              <div className="mt-5">
                <ProdutosManager
                  lojaId={loja.id}
                  categorias={categorias ?? []}
                  produtos={produtos ?? []}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
