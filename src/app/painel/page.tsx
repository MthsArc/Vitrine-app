import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import LojaForm from "./LojaForm";

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
      </div>
    </main>
  );
}
