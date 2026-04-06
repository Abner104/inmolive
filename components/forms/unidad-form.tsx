"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  propiedadId?: string;
  propiedades?: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function UnidadForm({ propiedadId, propiedades, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      propiedadId: propiedadId ?? (form.get("propiedadId") as string),
      nombre: form.get("nombre") as string,
      piso: form.get("piso") as string,
      precioArriendo: Number(form.get("precioArriendo")),
      moneda: form.get("moneda") as string,
      diaVencimiento: Number(form.get("diaVencimiento")),
    };
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Unidad creada");
      onSuccess?.();
    } catch {
      toast.error("Error al crear unidad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {propiedades && propiedades.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="propiedadId">Propiedad</Label>
          <Select name="propiedadId" required>
            <SelectTrigger id="propiedadId">
              <SelectValue placeholder="Seleccionar propiedad" />
            </SelectTrigger>
            <SelectContent>
              {propiedades.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre / número</Label>
        <Input id="nombre" name="nombre" placeholder="Depto 101" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="piso">Piso</Label>
        <Input id="piso" name="piso" placeholder="1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="precioArriendo">Precio arriendo</Label>
          <Input id="precioArriendo" name="precioArriendo" type="number" placeholder="500000" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="moneda">Moneda</Label>
          <Select name="moneda" defaultValue="CLP">
            <SelectTrigger id="moneda">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLP">CLP</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="DOP">DOP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="diaVencimiento">Día de vencimiento</Label>
        <Input id="diaVencimiento" name="diaVencimiento" type="number" min="1" max="28" placeholder="5" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Crear unidad"}
      </Button>
    </form>
  );
}
