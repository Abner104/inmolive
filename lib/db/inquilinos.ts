import { prisma } from "./prisma";

export async function getInquilinos(filters?: { propiedadId?: string; userId?: string }) {
  return prisma.tenant.findMany({
    where: {
      active: true,
      ...(filters?.propiedadId && { unit: { propertyId: filters.propiedadId } }),
      ...(filters?.userId && { unit: { property: { userId: filters.userId } } }),
    },
    include: { unit: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInquilino(id: string) {
  return prisma.tenant.findUnique({
    where: { id },
    include: { unit: { include: { property: true } }, charges: { orderBy: { createdAt: "desc" } } },
  });
}

export async function crearInquilino(data: {
  unidadId: string;
  nombreCompleto: string;
  telefono: string;
  email?: string;
  documento?: string;
  fechaInicioContrato: Date;
}) {
  const [inquilino] = await prisma.$transaction([
    prisma.tenant.create({
      data: {
        unitId: data.unidadId,
        fullName: data.nombreCompleto,
        phone: data.telefono,
        email: data.email,
        documentId: data.documento,
        contractStartDate: data.fechaInicioContrato,
      },
    }),
    prisma.unit.update({
      where: { id: data.unidadId },
      data: { status: "OCCUPIED" },
    }),
  ]);
  return inquilino;
}

export async function actualizarInquilino(
  id: string,
  data: {
    nombreCompleto?: string;
    telefono?: string;
    email?: string;
    documento?: string;
    activo?: boolean;
  }
) {
  return prisma.tenant.update({
    where: { id },
    data: {
      ...(data.nombreCompleto && { fullName: data.nombreCompleto }),
      ...(data.telefono && { phone: data.telefono }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.documento !== undefined && { documentId: data.documento }),
      ...(data.activo !== undefined && { active: data.activo }),
    },
  });
}

export async function desactivarInquilino(id: string) {
  const inquilino = await prisma.tenant.update({
    where: { id },
    data: { active: false },
  });
  await prisma.unit.update({
    where: { id: inquilino.unitId },
    data: { status: "AVAILABLE" },
  });
  return inquilino;
}
