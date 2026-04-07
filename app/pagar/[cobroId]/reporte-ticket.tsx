"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Wrench, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const CATEGORIAS = [
  { value: "plomeria",      label: "🔧 Plomería" },
  { value: "electricidad",  label: "⚡ Electricidad" },
  { value: "limpieza",      label: "🧹 Limpieza" },
  { value: "otro",          label: "📋 Otro" },
];

export function ReporteTicket({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoria, setCategoria] = useState("otro");
  const [prioridad, setPrioridad] = useState("normal");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          titulo: form.get("titulo"),
          descripcion: form.get("descripcion"),
          categoria,
          prioridad,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSent(true);
      toast.success("Reporte enviado al administrador");
      if (data.waUrl) {
        window.open(data.waUrl, "_blank");
      }
    } catch {
      toast.error("Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Reporte enviado</p>
          <p className="text-xs text-green-600 dark:text-green-500">El administrador fue notificado y se pondrá en contacto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Reportar un problema</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">¿Qué hay que arreglar?</Label>
              <Input name="titulo" placeholder="Ej: Gotera en el baño" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Categoría</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Urgencia</Label>
                <Select value={prioridad} onValueChange={setPrioridad}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta 🚨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Textarea name="descripcion" placeholder="Describí el problema con más detalle..." rows={3} required />
            </div>
            <Button type="submit" className="w-full" size="sm" disabled={loading}>
              {loading ? "Enviando..." : "Enviar reporte"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
