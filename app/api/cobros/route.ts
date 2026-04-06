import { NextRequest, NextResponse } from "next/server";
import { getCobros } from "@/lib/db/cobros";

// GET /api/cobros?propiedadId=xxx&estado=PENDING&periodo=2026-04
export async function GET(req: NextRequest) {
  const propiedadId = req.nextUrl.searchParams.get("propiedadId") ?? undefined;
  const estado = req.nextUrl.searchParams.get("estado") as any ?? undefined;
  const periodo = req.nextUrl.searchParams.get("periodo") ?? undefined;
  const data = await getCobros({ propiedadId, estado, periodo });
  return NextResponse.json(data);
}
