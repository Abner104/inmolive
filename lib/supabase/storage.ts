import { createClient } from "@supabase/supabase-js";

// Cliente con service role para operaciones de storage en servidor
// Por ahora usamos el anon key — el bucket debe ser público para subidas
export const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadComprobante(file: File, cobroId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `comprobantes/${cobroId}/${Date.now()}.${ext}`;

  const { error } = await supabaseStorage.storage
    .from("comprobantes")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabaseStorage.storage
    .from("comprobantes")
    .getPublicUrl(path);

  return data.publicUrl;
}
