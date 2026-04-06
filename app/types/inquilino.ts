export interface Inquilino {
  id: string;
  unidadId: string;
  nombreCompleto: string;
  telefono: string;
  email?: string;
  documento?: string;
  fechaInicioContrato: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}