import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// PATCH /api/unidades/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const unidad = await prisma.unit.findFirst({ where: { id: params.id, property: { userId } } });
  if (!unidad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.unit.update({
    where: { id: params.id },
    data: {
      ...(body.nombre && { name: body.nombre }),
      ...(body.piso !== undefined && { floor: body.piso || null }),
      ...(body.precioArriendo && { rentPrice: body.precioArriendo }),
      ...(body.moneda && { currency: body.moneda }),
      ...(body.estado && { status: body.estado }),
      ...(body.diaVencimiento && { dueDayOfMonth: body.diaVencimiento }),
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/unidades/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const unidad = await prisma.unit.findFirst({ where: { id: params.id, property: { userId } } });
  if (!unidad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.unit.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
