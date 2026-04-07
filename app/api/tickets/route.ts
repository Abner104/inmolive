import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push/send";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// GET /api/tickets — todos los tickets del usuario (para el admin)
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where: { unit: { property: { userId } } },
    include: { tenant: true, unit: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets — el inquilino crea un ticket (no requiere auth de usuario)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenantId, titulo, descripcion, categoria, prioridad } = body;

  // Verificar que el tenant existe
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { unit: true },
  });
  if (!tenant) return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });

  const ticket = await prisma.ticket.create({
    data: {
      titulo,
      descripcion,
      categoria: categoria ?? "otro",
      prioridad: prioridad ?? "normal",
      tenantId,
      unitId: tenant.unitId,
    },
  });

  // Notificar al admin
  const unit = await prisma.unit.findUnique({
    where: { id: tenant.unitId },
    include: { property: { include: { user: true } } },
  });

  if (unit) {
    sendPushToUser(unit.property.userId, {
      title: "Nuevo ticket de mantenimiento",
      body: `${tenant.fullName}: ${titulo}`,
      url: "/dashboard/tickets",
    }).catch(() => {});
  }

  return NextResponse.json(ticket, { status: 201 });
}
