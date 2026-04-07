import { NextResponse } from "next/server";

// WhatsApp con Baileys requiere un proceso Node.js persistente.
// Vercel es serverless — cada request es una función nueva, el estado global no persiste.
// Detectamos esto comprobando si estamos en Vercel.
const IS_SERVERLESS = !!process.env.VERCEL;

export async function GET() {
  if (IS_SERVERLESS) {
    return NextResponse.json({ connected: false, qr: null, serverless: true });
  }

  // Solo importar Baileys si no estamos en Vercel
  const { getWhatsAppStatus, initWhatsApp } = await import("@/lib/whatsapp/baileys");
  await initWhatsApp();
  const status = getWhatsAppStatus();
  return NextResponse.json(status);
}
