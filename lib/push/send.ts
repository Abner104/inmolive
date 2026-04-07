import webpush from "web-push";
import { prisma } from "@/lib/db/prisma";

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@inmio.vercel.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        message,
      ).catch(async (err) => {
        // Si la suscripción expiró, la eliminamos
        if (err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        }
      })
    )
  );
}
