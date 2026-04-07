import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// PATCH /api/tickets/[id] — admin actualiza estado o agrega comentario
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const ticket = await prisma.ticket.findFirst({
    where: { id, unit: { property: { userId } } },
  });
  if (!ticket) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.comentario !== undefined && { comentario: body.comentario }),
      ...(body.prioridad && { prioridad: body.prioridad }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/tickets/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const ticket = await prisma.ticket.findFirst({
    where: { id, unit: { property: { userId } } },
  });
  if (!ticket) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
