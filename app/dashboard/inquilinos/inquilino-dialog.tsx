"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Unidad {
  id: string;
  name: string;
  property: { name: string };
}

export function InquilinoDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetch("/api/unidades/disponibles")
        .then((r) => r.json())
        .then(setUnidades)
        .catch(() => toast.error("Error al cargar unidades"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      unidadId: form.get("unidadId") as string,
      nombreCompleto: form.get("nombreCompleto") as string,
      telefono: form.get("telefono") as string,
      email: form.get("email") as string || undefined,
      documento: form.get("documento") as string || undefined,
      fechaInicioContrato: form.get("fechaInicioContrato") as string,
    };
    try {
      const res = await fetch("/api/inquilinos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Inquilino registrado");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al registrar inquilino");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo inquilino
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo inquilino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="unidadId">Unidad</Label>
            <Select name="unidadId" required>
              <SelectTrigger id="unidadId">
                <SelectValue placeholder="Seleccionar unidad disponible" />
              </SelectTrigger>
              <SelectContent>
                {unidades.length === 0 ? (
                  <SelectItem value="none" disabled>No hay unidades disponibles</SelectItem>
                ) : (
                  unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.property.name} — {u.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nombreCompleto">Nombre completo</Label>
            <Input id="nombreCompleto" name="nombreCompleto" placeholder="Juan Pérez" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" placeholder="+56 9 1234 5678" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="juan@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="documento">Documento / RUT</Label>
              <Input id="documento" name="documento" placeholder="12.345.678-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaInicioContrato">Inicio de contrato</Label>
            <Input id="fechaInicioContrato" name="fechaInicioContrato" type="date" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Registrar inquilino"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
