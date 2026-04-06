import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const cobroId = formData.get("cobroId") as string;

  if (!file || !cobroId) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const path = `comprobantes/${cobroId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("comprobantes")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from("comprobantes").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, fileName: file.name });
}
