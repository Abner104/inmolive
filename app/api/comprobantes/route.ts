import { NextRequest, NextResponse } from "next/server";
import { crearComprobante } from "@/lib/db/comprobantes";

// POST /api/comprobantes { cobroId, fileUrl, fileName }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cobroId, fileUrl, fileName } = body;
  if (!cobroId || !fileUrl || !fileName) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const comprobante = await crearComprobante({ cobroId, fileUrl, fileName });
  return NextResponse.json(comprobante, { status: 201 });
}
