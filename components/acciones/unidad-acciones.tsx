"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2, Wrench } from "lucide-react";

interface Unidad {
  id: string;
  name: string;
  floor?: string | null;
  rentPrice: number;
  currency: string;
  dueDayOfMonth: number;
  status: string;
  rentalType: string;
}

export function UnidadAcciones({ unidad }: { unidad: Unidad }) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moneda, setMoneda] = useState(unidad.currency);
  const [rentalType, setRentalType] = useState(unidad.rentalType);
  const router = useRouter();

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/unidades/${unidad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          piso: form.get("piso") || null,
          precioArriendo: Number(form.get("precioArriendo")),
          moneda,
          diaVencimiento: Number(form.get("diaVencimiento")),
          rentalType,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Unidad actualizada");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleMantenimiento() {
    const nuevoEstado = unidad.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    try {
      await fetch(`/api/unidades/${unidad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      toast.success(nuevoEstado === "MAINTENANCE" ? "Unidad en mantenimiento" : "Unidad disponible");
      router.refresh();
    } catch {
      toast.error("Error al actualizar estado");
    }
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${unidad.name}"? Se eliminarán todos sus inquilinos y cobros.`)) return;
    try {
      await fetch(`/api/unidades/${unidad.id}`, { method: "DELETE" });
      toast.success("Unidad eliminada");
      router.refresh();
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMantenimiento} className="gap-2 text-yellow-600">
            <Wrench className="h-4 w-4" />
            {unidad.status === "MAINTENANCE" ? "Marcar disponible" : "Poner en mantenimiento"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEliminar} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar unidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input name="nombre" defaultValue={unidad.name} required />
              </div>
              <div className="space-y-1.5">
                <Label>Piso</Label>
                <Input name="piso" defaultValue={unidad.floor ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Precio</Label>
                <Input name="precioArriendo" type="number" defaultValue={unidad.rentPrice} required />
              </div>
              <div className="space-y-1.5">
                <Label>Moneda</Label>
                <Select value={moneda} onValueChange={setMoneda}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">CLP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="DOP">DOP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de alquiler</Label>
              <Select value={rentalType} onValueChange={setRentalType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="DAILY">Por día / noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rentalType === "MONTHLY" && (
              <div className="space-y-1.5">
                <Label>Día de vencimiento</Label>
                <Input name="diaVencimiento" type="number" min="1" max="28" defaultValue={unidad.dueDayOfMonth} required />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
