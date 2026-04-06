export interface Cobro {
  id: string;
  propiedadId: string;
  unidadId: string;
  inquilinoId: string;
  periodo: string; // 2026-04
  monto: number;
  fechaVencimiento: string;
  estado: "pendiente" | "pagado" | "atrasado" | "en_revision";
  comprobanteId?: string | null;
  createdAt: string;
  updatedAt: string;
}