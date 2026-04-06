"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  onSuccess?: () => void;
}

export function PropiedadForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      nombre: form.get("nombre") as string,
      direccion: form.get("direccion") as string,
      tipo: form.get("tipo") as string,
    };
    try {
      const res = await fetch("/api/propiedades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Propiedad creada");
      onSuccess?.();
    } catch {
      toast.error("Error al crear propiedad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" placeholder="Edificio Central" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" placeholder="Av. Principal 123" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tipo">Tipo</Label>
        <Select name="tipo" required>
          <SelectTrigger id="tipo">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HOUSE">Casa</SelectItem>
            <SelectItem value="BUILDING">Edificio</SelectItem>
            <SelectItem value="CONDO">Condominio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Crear propiedad"}
      </Button>
    </form>
  );
}
