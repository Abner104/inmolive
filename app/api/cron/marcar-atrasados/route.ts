import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Este endpoint lo llama un cron job diario
// En Vercel se configura en vercel.json o desde el dashboard
export async function GET() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { count } = await prisma.charge.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: hoy },
    },
    data: { status: "LATE" },
  });

  return NextResponse.json({ actualizados: count, fecha: hoy.toISOString() });
}
