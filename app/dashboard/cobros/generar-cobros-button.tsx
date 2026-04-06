"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export function GenerarCobrosButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerar() {
    setLoading(true);
    const periodo = new Date().toISOString().slice(0, 7); // "2026-04"
    try {
      const res = await fetch("/api/generar-cobros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.creados === 0) {
        toast.info(data.message ?? "Ya existen cobros para este periodo");
      } else {
        toast.success(`${data.creados} cobros generados para ${periodo}`);
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message ?? "Error al generar cobros");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleGenerar} disabled={loading} className="gap-2">
      <Zap className="h-4 w-4" />
      {loading ? "Generando..." : "Generar cobros"}
    </Button>
  );
}
