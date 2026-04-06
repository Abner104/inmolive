"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface Props {
  comprobanteId: string;
}

export function RevisarButtons({ comprobanteId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function revisar(estado: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/comprobantes/${comprobanteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      toast.success(estado === "APPROVED" ? "Comprobante aprobado" : "Comprobante rechazado");
      router.refresh();
    } catch {
      toast.error("Error al procesar el comprobante");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
        disabled={loading}
        onClick={() => revisar("APPROVED")}
      >
        <Check className="h-3.5 w-3.5" />
        Aprobar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={loading}
        onClick={() => revisar("REJECTED")}
      >
        <X className="h-3.5 w-3.5" />
        Rechazar
      </Button>
    </div>
  );
}
