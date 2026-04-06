import { NextRequest, NextResponse } from "next/server";
import { getCobros } from "@/lib/db/cobros";
import { sendWhatsAppMessage } from "@/lib/whatsapp/baileys";
import { paymentReminderTemplate } from "@/lib/whatsapp/templates";

// POST /api/whatsapp/enviar-recordatorio { periodo: "2026-04" }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const periodo = body.periodo as string;

  const cobros = await getCobros({ estado: "PENDING", periodo });
  const resultados: { inquilino: string; status: string }[] = [];

  for (const cobro of cobros) {
    try {
      const mensaje = paymentReminderTemplate({
        nombre: cobro.tenant.fullName,
        monto: `${cobro.unit.currency} ${cobro.amount.toLocaleString()}`,
        fecha: new Date(cobro.dueDate).toLocaleDateString("es-CL"),
        link: `${process.env.NEXT_PUBLIC_APP_URL}/pagar/${cobro.id}`,
      });
      await sendWhatsAppMessage(cobro.tenant.phone, mensaje);
      resultados.push({ inquilino: cobro.tenant.fullName, status: "enviado" });
    } catch {
      resultados.push({ inquilino: cobro.tenant.fullName, status: "error" });
    }
  }

  return NextResponse.json({ total: cobros.length, resultados });
}
