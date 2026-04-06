"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  unidadId: string;
  onSuccess?: () => void;
}

export function InquilinoForm({ unidadId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      unidadId,
      nombreCompleto: form.get("nombreCompleto") as string,
      telefono: form.get("telefono") as string,
      email: form.get("email") as string,
      documento: form.get("documento") as string,
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
      onSuccess?.();
    } catch {
      toast.error("Error al registrar inquilino");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombreCompleto">Nombre completo</Label>
        <Input id="nombreCompleto" name="nombreCompleto" placeholder="Juan Pérez" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" name="telefono" placeholder="+56 9 1234 5678" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="juan@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="documento">Documento / RUT</Label>
        <Input id="documento" name="documento" placeholder="12.345.678-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fechaInicioContrato">Inicio de contrato</Label>
        <Input id="fechaInicioContrato" name="fechaInicioContrato" type="date" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Registrar inquilino"}
      </Button>
    </form>
  );
}
