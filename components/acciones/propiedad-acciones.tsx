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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Propiedad {
  id: string;
  name: string;
  address: string;
  type: string;
}

export function PropiedadAcciones({ propiedad }: { propiedad: Propiedad }) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState(propiedad.type);
  const router = useRouter();

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/propiedades/${propiedad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          direccion: form.get("direccion"),
          tipo,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Propiedad actualizada");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${propiedad.name}"? Se eliminarán todas sus unidades e inquilinos.`)) return;
    try {
      await fetch(`/api/propiedades/${propiedad.id}`, { method: "DELETE" });
      toast.success("Propiedad eliminada");
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEliminar} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar propiedad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input name="nombre" defaultValue={propiedad.name} required />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input name="direccion" defaultValue={propiedad.address} required />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE">Casa</SelectItem>
                  <SelectItem value="BUILDING">Edificio</SelectItem>
                  <SelectItem value="CONDO">Condominio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
