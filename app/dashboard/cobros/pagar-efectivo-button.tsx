"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PagarEfectivoButton({ cobroId }: { cobroId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState("");
  const router = useRouter();

  async function handleConfirmar() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cobros/${cobroId}/pagar-efectivo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota }),
      });
      if (!res.ok) throw new Error();
      toast.success("Cobro marcado como pagado en efectivo");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50">
          <Banknote className="h-3 w-3" />
          Efectivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago en efectivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esto marcará el cobro como <span className="font-semibold text-green-600">Pagado</span> y registrará que fue abonado en efectivo.
          </p>
          <div className="space-y-1.5">
            <Label>Nota (opcional)</Label>
            <Textarea
              placeholder="Ej: Pagó en mano el 06/04, recibí yo..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirmar} disabled={loading}>
              {loading ? "Guardando..." : "Confirmar pago"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
