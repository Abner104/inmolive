import { NextRequest, NextResponse } from "next/server";
import { getPropiedades, crearPropiedad } from "@/lib/db/propiedades";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

async function getOrCreateUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const monedaDefault = (user.user_metadata?.monedaDefault ?? "CLP") as "CLP" | "USD" | "DOP";
  await prisma.user.upsert({
    where: { id: user.id },
    update: { monedaDefault },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      monedaDefault,
    },
  });

  return user.id;
}

// GET /api/propiedades
export async function GET() {
  const userId = await getOrCreateUser();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await getPropiedades(userId);
  return NextResponse.json(data);
}

// POST /api/propiedades
export async function POST(req: NextRequest) {
  const userId = await getOrCreateUser();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const propiedad = await crearPropiedad({
    userId,
    nombre: body.nombre,
    direccion: body.direccion,
    tipo: body.tipo,
  });
  return NextResponse.json(propiedad, { status: 201 });
}
