import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      message: "Conexión a PostgreSQL funcionando correctamente",
    });
  } catch (error) {
    console.error("DB error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo conectar a PostgreSQL",
      },
      { status: 500 }
    );
  }
}