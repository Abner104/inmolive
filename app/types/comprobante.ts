export interface Comprobante {
  id: string;
  cobroId: string;
  url: string;
  nombreArchivo: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  comentarioAdmin?: string;
  createdAt: string;
  updatedAt: string;
}