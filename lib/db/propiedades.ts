import { prisma } from "./prisma";

type PropertyType = "HOUSE" | "BUILDING" | "CONDO";

export async function getPropiedades(userId: string) {
  return prisma.property.findMany({
    where: { userId },
    include: { units: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropiedad(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: { units: { include: { tenants: true } } },
  });
}

export async function crearPropiedad(data: {
  userId: string;
  nombre: string;
  direccion: string;
  tipo: PropertyType;
}) {
  return prisma.property.create({
    data: {
      userId: data.userId,
      name: data.nombre,
      address: data.direccion,
      type: data.tipo,
    },
  });
}

export async function actualizarPropiedad(
  id: string,
  data: { nombre?: string; direccion?: string; tipo?: PropertyType }
) {
  return prisma.property.update({
    where: { id },
    data: {
      ...(data.nombre && { name: data.nombre }),
      ...(data.direccion && { address: data.direccion }),
      ...(data.tipo && { type: data.tipo }),
    },
  });
}

export async function eliminarPropiedad(id: string) {
  return prisma.property.delete({ where: { id } });
}
