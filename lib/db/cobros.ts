import { prisma } from "./prisma";

type ChargeStatus = "PENDING" | "PAID" | "LATE" | "REVIEW";

export async function getCobros(filters?: { propiedadId?: string; estado?: ChargeStatus; periodo?: string; userId?: string }) {
  return prisma.charge.findMany({
    where: {
      ...(filters?.propiedadId && { propertyId: filters.propiedadId }),
      ...(filters?.estado && { status: filters.estado }),
      ...(filters?.periodo && { period: filters.periodo }),
      ...(filters?.userId && { property: { userId: filters.userId } }),
    },
    include: {
      property: true,
      unit: true,
      tenant: true,
      paymentProof: true,
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getCobro(id: string) {
  return prisma.charge.findUnique({
    where: { id },
    include: { property: true, unit: true, tenant: true, paymentProof: true },
  });
}

export async function generarCobros(periodo: string) {
  // Obtener todas las unidades ocupadas con su inquilino activo
  const unidades = await prisma.unit.findMany({
    where: { status: "OCCUPIED" },
    include: { tenants: { where: { active: true }, take: 1 } },
  });

  const cobrosACrear = unidades
    .filter((u) => u.tenants.length > 0)
    .map((unidad) => {
      const [year, month] = periodo.split("-").map(Number);
      const dueDate = new Date(year, month - 1, unidad.dueDayOfMonth);
      return {
        period: periodo,
        amount: unidad.rentPrice,
        dueDate,
        propertyId: unidad.propertyId,
        unitId: unidad.id,
        tenantId: unidad.tenants[0].id,
      };
    });

  // Evitar duplicados por periodo + unidad
  const existentes = await prisma.charge.findMany({
    where: { period: periodo },
    select: { unitId: true },
  });
  const unidadesConCobro = new Set(existentes.map((c) => c.unitId));
  const nuevos = cobrosACrear.filter((c) => !unidadesConCobro.has(c.unitId));

  if (nuevos.length === 0) return { creados: 0, message: "Ya existen cobros para este periodo" };

  await prisma.charge.createMany({ data: nuevos });
  return { creados: nuevos.length };
}

export async function actualizarEstadoCobro(id: string, estado: ChargeStatus) {
  return prisma.charge.update({ where: { id }, data: { status: estado } });
}

export async function getResumenCobros(userId: string) {
  const cobros = await prisma.charge.findMany({
    where: { property: { userId } },
    select: { status: true },
  });

  return {
    total: cobros.length,
    pagados: cobros.filter((c) => c.status === "PAID").length,
    pendientes: cobros.filter((c) => c.status === "PENDING").length,
    atrasados: cobros.filter((c) => c.status === "LATE").length,
    enRevision: cobros.filter((c) => c.status === "REVIEW").length,
  };
}
