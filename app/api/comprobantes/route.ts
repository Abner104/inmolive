import { NextRequest, NextResponse } from "next/server";
import { crearComprobante } from "@/lib/db/comprobantes";
import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/push/send";

// POST /api/comprobantes { cobroId, fileUrl, fileName }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cobroId, fileUrl, fileName } = body;
  if (!cobroId || !fileUrl || !fileName) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  const comprobante = await crearComprobante({ cobroId, fileUrl, fileName });

  // Notificar al admin
  const cobro = await prisma.charge.findUnique({
    where: { id: cobroId },
    include: { tenant: true, property: { include: { user: true } } },
  });

  if (cobro) {
    console.log("[comprobante] llamando sendPushToUser para userId:", cobro.property.userId);
    sendPushToUser(cobro.property.userId, {
      title: "Comprobante recibido",
      body: `${cobro.tenant.fullName} subió un comprobante de pago.`,
      url: "/dashboard/cobros",
    }).catch((err) => console.error("[comprobante] error en sendPushToUser:", err));
  } else {
    console.log("[comprobante] cobro no encontrado para cobroId:", cobroId);
  }

  return NextResponse.json(comprobante, { status: 201 });
}
