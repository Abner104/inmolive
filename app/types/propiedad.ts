export interface Propiedad {
  id: string;
  userId: string;
  nombre: string;
  direccion: string;
  tipo: "casa" | "edificio" | "condominio";
  createdAt: string;
  updatedAt: string;
}