import { prisma } from "./prisma";

type ProofStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function getComprobantes(filters?: { estado?: ProofStatus; userId?: string }) {
  return prisma.paymentProof.findMany({
    where: {
      ...(filters?.estado && { status: filters.estado }),
      ...(filters?.userId && { charge: { property: { userId: filters.userId } } }),
    },
    include: {
      charge: {
        include: { property: true, unit: true, tenant: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getComprobante(id: string) {
  return prisma.paymentProof.findUnique({
    where: { id },
    include: { charge: { include: { property: true, unit: true, tenant: true } } },
  });
}

export async function crearComprobante(data: {
  cobroId: string;
  fileUrl: string;
  fileName: string;
}) {
  // Si había un comprobante rechazado, lo eliminamos antes de crear uno nuevo
  await prisma.paymentProof.deleteMany({
    where: { chargeId: data.cobroId, status: "REJECTED" },
  });

  const [comprobante] = await prisma.$transaction([
    prisma.paymentProof.create({
      data: {
        chargeId: data.cobroId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      },
    }),
    prisma.charge.update({
      where: { id: data.cobroId },
      data: { status: "REVIEW" },
    }),
  ]);
  return comprobante;
}

export async function revisarComprobante(
  id: string,
  decision: { estado: ProofStatus; comentario?: string }
) {
  const comprobante = await prisma.paymentProof.update({
    where: { id },
    data: { status: decision.estado, comment: decision.comentario },
  });

  await prisma.charge.update({
    where: { id: comprobante.chargeId },
    data: { status: decision.estado === "APPROVED" ? "PAID" : "PENDING" },
  });

  return comprobante;
}
