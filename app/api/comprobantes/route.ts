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

  let waUrl: string | null = null;

  if (cobro) {
    sendPushToUser(cobro.property.userId, {
      title: "Comprobante recibido",
      body: `${cobro.tenant.fullName} subió un comprobante de pago.`,
      url: "/dashboard/cobros",
    }).catch(() => {});

    const adminPhone = cobro.property.user.phone?.replace(/\D/g, "");
    if (adminPhone) {
      const appUrl = "https://inmio.vercel.app";
      const msg = `🧾 *Nuevo comprobante de pago*\n\nInquilino: *${cobro.tenant.fullName}*\nPeríodo: ${cobro.period}\n\nRevisalo aquí 👇 ${appUrl}/dashboard/comprobantes`;
      waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    }
  }

  return NextResponse.json({ ...comprobante, waUrl }, { status: 201 });
}
