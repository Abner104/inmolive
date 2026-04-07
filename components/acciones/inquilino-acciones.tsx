"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Pencil, UserX, Trash2 } from "lucide-react";

interface Inquilino {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  documentId?: string | null;
  active: boolean;
}

export function InquilinoAcciones({ inquilino }: { inquilino: Inquilino }) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/inquilinos/${inquilino.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCompleto: form.get("nombreCompleto"),
          telefono: form.get("telefono"),
          email: form.get("email") || null,
          documento: form.get("documento") || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Inquilino actualizado");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspender() {
    if (!confirm(`¿Suspender a ${inquilino.fullName}? La unidad quedará disponible.`)) return;
    try {
      await fetch(`/api/inquilinos/${inquilino.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: false }),
      });
      toast.success("Inquilino suspendido");
      router.refresh();
    } catch {
      toast.error("Error al suspender");
    }
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar a ${inquilino.fullName}? Esta acción no se puede deshacer.`)) return;
    try {
      await fetch(`/api/inquilinos/${inquilino.id}`, { method: "DELETE" });
      toast.success("Inquilino eliminado");
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
          {inquilino.active && (
            <DropdownMenuItem onClick={handleSuspender} className="gap-2 text-yellow-600">
              <UserX className="h-4 w-4" /> Suspender
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEliminar} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar inquilino</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input name="nombreCompleto" defaultValue={inquilino.fullName} required />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input name="telefono" defaultValue={inquilino.phone} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={inquilino.email ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label>Documento</Label>
                <Input name="documento" defaultValue={inquilino.documentId ?? ""} />
              </div>
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
