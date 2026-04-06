import { NextResponse } from "next/server";
import { getWhatsAppStatus, initWhatsApp } from "@/lib/whatsapp/baileys";

export async function GET() {
  // Arranca la conexión si todavía no está activa
  await initWhatsApp();
  const status = getWhatsAppStatus();
  return NextResponse.json(status);
}
