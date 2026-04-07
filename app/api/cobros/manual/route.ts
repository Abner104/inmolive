import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// POST /api/cobros/manual — crea un cobro puntual para un inquilino
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { tenantId, monto, periodo, fechaVencimiento, descripcion } = body;

  // Verificar que el inquilino pertenece al usuario
  const inquilino = await prisma.tenant.findFirst({
    where: { id: tenantId, unit: { property: { userId } } },
    include: { unit: true },
  });
  if (!inquilino) return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });

  const cobro = await prisma.charge.create({
    data: {
      period: periodo,
      amount: monto,
      dueDate: new Date(fechaVencimiento),
      propertyId: inquilino.unit.propertyId,
      unitId: inquilino.unitId,
      tenantId,
      ...(descripcion && { description: descripcion }),
    },
  });

  return NextResponse.json(cobro, { status: 201 });
}
