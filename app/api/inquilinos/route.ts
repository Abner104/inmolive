import { NextRequest, NextResponse } from "next/server";
import { getInquilinos, crearInquilino } from "@/lib/db/inquilinos";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppMessage, getWhatsAppStatus } from "@/lib/whatsapp/baileys";
import { mensajeBienvenida } from "@/lib/whatsapp/templates";

// GET /api/inquilinos?propiedadId=xxx (opcional)
export async function GET(req: NextRequest) {
  const propiedadId = req.nextUrl.searchParams.get("propiedadId") ?? undefined;
  const data = await getInquilinos({ propiedadId });
  return NextResponse.json(data);
}

// POST /api/inquilinos
export async function POST(req: NextRequest) {
  const body = await req.json();

  const inquilino = await crearInquilino({
    unidadId: body.unidadId,
    nombreCompleto: body.nombreCompleto,
    telefono: body.telefono,
    email: body.email,
    documento: body.documento,
    fechaInicioContrato: new Date(body.fechaInicioContrato),
  });

  // Enviar bienvenida por WhatsApp si está conectado
  try {
    const { connected } = getWhatsAppStatus();
    if (connected) {
      const unidad = await prisma.unit.findUnique({
        where: { id: body.unidadId },
        include: { property: true },
      });

      if (unidad) {
        // Generar cobro del mes actual para tener el link
        const hoy = new Date();
        const periodo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
        const dueDate = new Date(hoy.getFullYear(), hoy.getMonth(), unidad.dueDayOfMonth);

        const cobro = await prisma.charge.upsert({
          where: { id: `temp-${inquilino.id}-${periodo}` },
          update: {},
          create: {
            period: periodo,
            amount: unidad.rentPrice,
            dueDate,
            propertyId: unidad.propertyId,
            unitId: unidad.id,
            tenantId: inquilino.id,
          },
        });

        const linkPago = `${process.env.NEXT_PUBLIC_APP_URL}/pagar/${cobro.id}`;

        await sendWhatsAppMessage(
          inquilino.phone,
          mensajeBienvenida({
            nombre: inquilino.fullName,
            unidad: unidad.name,
            propiedad: unidad.property.name,
            monto: unidad.rentPrice.toLocaleString(),
            moneda: unidad.currency,
            diaVencimiento: unidad.dueDayOfMonth,
            linkPago,
          })
        );
      }
    }
  } catch (err) {
    // No fallar si WhatsApp no está disponible
    console.error("WhatsApp bienvenida error:", err);
  }

  return NextResponse.json(inquilino, { status: 201 });
}
