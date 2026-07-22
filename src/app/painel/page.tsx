import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold tracking-tight">Vitrine.app</span>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold">Bem-vindo ao seu painel</h1>
        <p className="mt-2 text-ink/60">
          Logado como <span className="font-medium text-ink">{user?.email}</span>
        </p>
        <p className="mt-6 text-sm text-ink/50">
          Próximo passo: cadastrar os dados da sua loja aqui.
        </p>
      </div>
    </main>
  );
}
