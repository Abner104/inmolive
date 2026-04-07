"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Inquilino {
  id: string;
  fullName: string;
  unit: { name: string; property: { name: string } };
}

export function CobroManualButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [inquilinoId, setInquilinoId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetch("/api/inquilinos")
        .then(r => r.json())
        .then(setInquilinos)
        .catch(() => toast.error("Error al cargar inquilinos"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inquilinoId) { toast.error("Seleccioná un inquilino"); return; }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/cobros/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: inquilinoId,
          monto: Number(form.get("monto")),
          periodo: form.get("periodo"),
          fechaVencimiento: form.get("fechaVencimiento"),
          descripcion: form.get("descripcion") || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cobro creado");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al crear cobro");
    } finally {
      setLoading(false);
    }
  }

  const hoy = new Date();
  const periodoDefault = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const fechaDefault = hoy.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Cobro manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cobro manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Inquilino</Label>
            <Select value={inquilinoId} onValueChange={setInquilinoId} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar inquilino" /></SelectTrigger>
              <SelectContent>
                {inquilinos.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.fullName} — {i.unit.property.name} / {i.unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monto</Label>
              <Input name="monto" type="number" placeholder="50000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Período</Label>
              <Input name="periodo" defaultValue={periodoDefault} placeholder="2026-04" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha de vencimiento</Label>
            <Input name="fechaVencimiento" type="date" defaultValue={fechaDefault} required />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input name="descripcion" placeholder="Ej: Gastos comunes, estadia 3 noches..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear cobro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
