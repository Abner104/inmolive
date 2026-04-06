import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWhatsAppMessage, getWhatsAppStatus } from "@/lib/whatsapp/baileys";
import { mensajeAviso5Dias, mensajeRecordatorio } from "@/lib/whatsapp/templates";
import { formatFecha } from "@/lib/utils/fecha";

// GET /api/cron/notificaciones
// Llamar diariamente — maneja los 3 flujos automáticos:
// 1. Marca atrasados
// 2. Avisa 5 días antes del vencimiento
// 3. Recordatorio al día siguiente de vencer sin pagar

export async function GET() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const en5Dias = new Date(hoy);
  en5Dias.setDate(en5Dias.getDate() + 5);
  en5Dias.setHours(23, 59, 59, 999);

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  const resultados = {
    marcadosAtrasados: 0,
    avisos5Dias: 0,
    recordatorios: 0,
    errores: [] as string[],
  };

  // 1. Marcar como atrasados los PENDING vencidos
  const { count } = await prisma.charge.updateMany({
    where: { status: "PENDING", dueDate: { lt: hoy } },
    data: { status: "LATE" },
  });
  resultados.marcadosAtrasados = count;

  const { connected } = getWhatsAppStatus();
  if (!connected) {
    return NextResponse.json({ ...resultados, whatsapp: "desconectado" });
  }

  // 2. Aviso 5 días antes — cobros PENDING que vencen en exactamente 5 días
  const cobros5Dias = await prisma.charge.findMany({
    where: {
      status: "PENDING",
      dueDate: { gte: new Date(en5Dias.setHours(0, 0, 0, 0)), lte: en5Dias },
    },
    include: { tenant: true, unit: true },
  });

  for (const cobro of cobros5Dias) {
    try {
      const linkPago = `${process.env.NEXT_PUBLIC_APP_URL}/pagar/${cobro.id}`;
      await sendWhatsAppMessage(
        cobro.tenant.phone,
        mensajeAviso5Dias({
          nombre: cobro.tenant.fullName,
          monto: cobro.amount.toLocaleString(),
          moneda: cobro.unit.currency,
          fechaVencimiento: formatFecha(cobro.dueDate),
          linkPago,
        })
      );
      resultados.avisos5Dias++;
    } catch (err: any) {
      resultados.errores.push(`aviso5dias:${cobro.id}: ${err.message}`);
    }
  }

  // 3. Recordatorio — cobros LATE cuyo vencimiento fue ayer
  const cobrosVencidosAyer = await prisma.charge.findMany({
    where: {
      status: "LATE",
      dueDate: {
        gte: new Date(ayer.setHours(0, 0, 0, 0)),
        lte: new Date(ayer.setHours(23, 59, 59, 999)),
      },
    },
    include: { tenant: true, unit: true },
  });

  for (const cobro of cobrosVencidosAyer) {
    try {
      const linkPago = `${process.env.NEXT_PUBLIC_APP_URL}/pagar/${cobro.id}`;
      await sendWhatsAppMessage(
        cobro.tenant.phone,
        mensajeRecordatorio({
          nombre: cobro.tenant.fullName,
          monto: cobro.amount.toLocaleString(),
          moneda: cobro.unit.currency,
          fechaVencimiento: formatFecha(cobro.dueDate),
          linkPago,
        })
      );
      resultados.recordatorios++;
    } catch (err: any) {
      resultados.errores.push(`recordatorio:${cobro.id}: ${err.message}`);
    }
  }

  return NextResponse.json(resultados);
}
