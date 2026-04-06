export interface Unidad {
  id: string;
  propiedadId: string;
  nombre: string;
  piso?: string;
  precioArriendo: number;
  moneda: "CLP" | "USD" | "DOP";
  estado: "ocupado" | "disponible" | "mantenimiento";
  diaVencimiento: number;
  inquilinoId?: string | null;
  createdAt: string;
  updatedAt: string;
}