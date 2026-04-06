import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const unidades = await prisma.unit.findMany({
    where: {
      status: "AVAILABLE",
      property: { userId: user.id },
    },
    include: { property: { select: { name: true } } },
    orderBy: [{ propertyId: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(unidades);
}
