import { NextRequest, NextResponse } from "next/server";
import { getUnidades, crearUnidad } from "@/lib/db/unidades";

// GET /api/unidades?propiedadId=xxx
export async function GET(req: NextRequest) {
  const propiedadId = req.nextUrl.searchParams.get("propiedadId");
  if (!propiedadId) return NextResponse.json({ error: "propiedadId requerido" }, { status: 400 });
  const data = await getUnidades(propiedadId);
  return NextResponse.json(data);
}

// POST /api/unidades
export async function POST(req: NextRequest) {
  const body = await req.json();
  const unidad = await crearUnidad({
    propiedadId: body.propiedadId,
    nombre: body.nombre,
    piso: body.piso,
    precioArriendo: body.precioArriendo,
    moneda: body.moneda ?? "CLP",
    diaVencimiento: body.diaVencimiento ?? 1,
  });
  return NextResponse.json(unidad, { status: 201 });
}
