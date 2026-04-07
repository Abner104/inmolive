import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// PATCH /api/propiedades/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const propiedad = await prisma.property.findFirst({ where: { id, userId } });
  if (!propiedad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.property.update({
    where: { id },
    data: {
      ...(body.nombre && { name: body.nombre }),
      ...(body.direccion && { address: body.direccion }),
      ...(body.tipo && { type: body.tipo }),
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/propiedades/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const propiedad = await prisma.property.findFirst({ where: { id, userId } });
  if (!propiedad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
