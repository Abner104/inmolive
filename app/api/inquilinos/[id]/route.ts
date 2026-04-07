import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// PATCH /api/inquilinos/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const inquilino = await prisma.tenant.findFirst({
    where: { id, unit: { property: { userId } } },
  });
  if (!inquilino) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      ...(body.nombreCompleto && { fullName: body.nombreCompleto }),
      ...(body.telefono && { phone: body.telefono }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.documento !== undefined && { documentId: body.documento || null }),
      ...(body.activo !== undefined && { active: body.activo }),
    },
  });

  // Si se suspende, liberar la unidad
  if (body.activo === false) {
    await prisma.unit.update({
      where: { id: inquilino.unitId },
      data: { status: "AVAILABLE" },
    });
  }

  return NextResponse.json(updated);
}

// DELETE /api/inquilinos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const inquilino = await prisma.tenant.findFirst({
    where: { id, unit: { property: { userId } } },
  });
  if (!inquilino) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.tenant.delete({ where: { id } });
  await prisma.unit.update({
    where: { id: inquilino.unitId },
    data: { status: "AVAILABLE" },
  });

  return NextResponse.json({ ok: true });
}
