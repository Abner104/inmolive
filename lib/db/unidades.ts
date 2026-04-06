import { prisma } from "./prisma";

type Currency = "CLP" | "USD" | "DOP";
type UnitStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export async function getUnidades(propiedadId: string) {
  return prisma.unit.findMany({
    where: { propertyId: propiedadId },
    include: { tenants: { where: { active: true }, take: 1 } },
    orderBy: { name: "asc" },
  });
}

export async function getUnidad(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: { tenants: true, charges: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
}

export async function crearUnidad(data: {
  propiedadId: string;
  nombre: string;
  piso?: string;
  precioArriendo: number;
  moneda: Currency;
  diaVencimiento: number;
}) {
  return prisma.unit.create({
    data: {
      propertyId: data.propiedadId,
      name: data.nombre,
      floor: data.piso,
      rentPrice: data.precioArriendo,
      currency: data.moneda,
      dueDayOfMonth: data.diaVencimiento,
    },
  });
}

export async function actualizarUnidad(
  id: string,
  data: {
    nombre?: string;
    piso?: string;
    precioArriendo?: number;
    moneda?: Currency;
    estado?: UnitStatus;
    diaVencimiento?: number;
  }
) {
  return prisma.unit.update({
    where: { id },
    data: {
      ...(data.nombre && { name: data.nombre }),
      ...(data.piso !== undefined && { floor: data.piso }),
      ...(data.precioArriendo && { rentPrice: data.precioArriendo }),
      ...(data.moneda && { currency: data.moneda }),
      ...(data.estado && { status: data.estado }),
      ...(data.diaVencimiento && { dueDayOfMonth: data.diaVencimiento }),
    },
  });
}

export async function eliminarUnidad(id: string) {
  return prisma.unit.delete({ where: { id } });
}
