import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/push/send";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { pushSubs: { select: { id: true } } },
  });

  if (!dbUser || dbUser.pushSubs.length === 0) {
    return NextResponse.json({ error: "No tenés notificaciones activadas en este navegador" }, { status: 400 });
  }

  await sendPushToUser(user.id, {
    title: "Notificación de prueba",
    body: "Las notificaciones push están funcionando correctamente.",
    url: "/dashboard",
  });

  return NextResponse.json({ ok: true });
}
