import { createClient } from "./client";

export async function uploadImage(file: File, path: string): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("imagens")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("imagens").getPublicUrl(path);
  return data.publicUrl;
}

export function extensionOf(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
}
