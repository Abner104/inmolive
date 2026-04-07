import webpush from "web-push";
import { prisma } from "@/lib/db/prisma";

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  console.log("[push] sendPushToUser userId:", userId, "payload:", payload);
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@inmio.vercel.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  console.log("[push] subs encontradas:", subs.length, "para userId:", userId);
  const todas = await prisma.pushSubscription.findMany({ select: { userId: true } });
  console.log("[push] todas las subs en BD:", JSON.stringify(todas));
  if (!subs.length) return;

  const message = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        message,
      ).catch(async (err) => {
        console.log("[push] error enviando:", err.statusCode, err.message);
        if (err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        }
      })
    )
  );
  console.log("[push] resultados:", JSON.stringify(results));
}
