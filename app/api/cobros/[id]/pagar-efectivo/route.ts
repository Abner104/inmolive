import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { nota } = await req.json();

  // Verificar que el cobro pertenece al usuario
  const cobro = await prisma.charge.findFirst({
    where: { id, property: { userId: user.id } },
  });
  if (!cobro) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.charge.update({
      where: { id },
      data: { status: "PAID" },
    }),
    prisma.paymentProof.upsert({
      where: { chargeId: id },
      update: { status: "APPROVED", comment: nota || "Pago en efectivo" },
      create: {
        chargeId: id,
        fileUrl: "",
        fileName: "Efectivo",
        status: "APPROVED",
        comment: nota || "Pago en efectivo",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
