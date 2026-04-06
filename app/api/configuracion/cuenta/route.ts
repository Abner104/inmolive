import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// GET /api/configuracion/cuenta — devuelve todas las cuentas del usuario
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [cuentas, user] = await Promise.all([
    prisma.cuentaPago.findMany({ where: { userId }, orderBy: { moneda: "asc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { monedaDefault: true } }),
  ]);

  return NextResponse.json({ cuentas, monedaDefault: user?.monedaDefault ?? "CLP" });
}

// POST /api/configuracion/cuenta — guarda o actualiza una cuenta por moneda
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  // Guardar moneda default del usuario
  if (body.monedaDefault) {
    await prisma.user.update({
      where: { id: userId },
      data: { monedaDefault: body.monedaDefault },
    });
  }

  // Guardar cuenta para la moneda indicada
  if (body.moneda) {
    await prisma.cuentaPago.upsert({
      where: { userId_moneda: { userId, moneda: body.moneda } },
      update: {
        titular: body.titular,
        email: body.email || null,
        instrucciones: body.instrucciones || null,
        banco: body.banco || null,
        tipoCuenta: body.tipoCuenta || null,
        numeroCuenta: body.numeroCuenta || null,
        documento: body.documento || null,
        metodoUSD: body.metodoUSD || null,
        zellePhone: body.zellePhone || null,
        paypalEmail: body.paypalEmail || null,
      },
      create: {
        userId,
        moneda: body.moneda,
        titular: body.titular,
        email: body.email || null,
        instrucciones: body.instrucciones || null,
        banco: body.banco || null,
        tipoCuenta: body.tipoCuenta || null,
        numeroCuenta: body.numeroCuenta || null,
        documento: body.documento || null,
        metodoUSD: body.metodoUSD || null,
        zellePhone: body.zellePhone || null,
        paypalEmail: body.paypalEmail || null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
