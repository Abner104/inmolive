import { NextRequest, NextResponse } from 'next/server';
import { generarCobros } from '@/lib/db/cobros';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const periodo = body.periodo as string;
  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
    return NextResponse.json({ error: 'Periodo invalido. Formato esperado: YYYY-MM' }, { status: 400 });
  }
  const result = await generarCobros(periodo);
  return NextResponse.json(result);
}
