import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.redirect(
    new URL(`/pagar/${id}`, process.env.NEXT_PUBLIC_APP_URL ?? "https://inmio.vercel.app")
  );
}
