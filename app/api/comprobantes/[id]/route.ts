import { NextRequest, NextResponse } from "next/server";
import { revisarComprobante } from "@/lib/db/comprobantes";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/comprobantes/[id] { estado: "APPROVED" | "REJECTED", comentario? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const comprobante = await revisarComprobante(id, {
    estado: body.estado,
    comentario: body.comentario,
  });
  return NextResponse.json(comprobante);
}
