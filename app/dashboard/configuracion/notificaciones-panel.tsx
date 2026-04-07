"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Play, BellRing } from "lucide-react";
import { toast } from "sonner";

interface Resultado {
  marcadosAtrasados: number;
  avisos5Dias: number;
  recordatorios: number;
  errores: string[];
  whatsapp?: string;
}

export function NotificacionesPanel() {
  const [loading, setLoading] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [ultimo, setUltimo] = useState<Resultado | null>(null);

  async function handleEjecutar() {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/notificaciones");
      const data: Resultado = await res.json();
      setUltimo(data);
      if (data.whatsapp === "desconectado") {
        toast.warning("Cobros actualizados pero WhatsApp desconectado — no se enviaron mensajes");
      } else {
        toast.success(`Listo: ${data.avisos5Dias} avisos + ${data.recordatorios} recordatorios enviados`);
      }
    } catch {
      toast.error("Error al ejecutar notificaciones");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestPush() {
    setLoadingPush(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al enviar notificación de prueba");
      } else {
        toast.success("Notificación de prueba enviada");
      }
    } catch {
      toast.error("Error al enviar notificación de prueba");
    } finally {
      setLoadingPush(false);
    }
  }

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-yellow-500" />
          Notificaciones automáticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
            <span className="mt-0.5 text-base">👋</span>
            <div>
              <p className="font-medium text-foreground">Bienvenida</p>
              <p>Se envía automáticamente al registrar un inquilino nuevo</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
            <span className="mt-0.5 text-base">📅</span>
            <div>
              <p className="font-medium text-foreground">Aviso 5 días antes</p>
              <p>Recuerda al inquilino que su vencimiento se acerca</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
            <span className="mt-0.5 text-base">⚠️</span>
            <div>
              <p className="font-medium text-foreground">Recordatorio post-vencimiento</p>
              <p>Al día siguiente de vencer sin pagar</p>
            </div>
          </div>
        </div>

        {ultimo && (
          <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Último resultado:</p>
            <p>Cobros marcados atrasados: <span className="font-medium">{ultimo.marcadosAtrasados}</span></p>
            <p>Avisos enviados (5 días): <span className="font-medium">{ultimo.avisos5Dias}</span></p>
            <p>Recordatorios enviados: <span className="font-medium">{ultimo.recordatorios}</span></p>
            {ultimo.errores.length > 0 && (
              <p className="text-red-500">Errores: {ultimo.errores.length}</p>
            )}
          </div>
        )}

        <Button className="w-full gap-2" onClick={handleEjecutar} disabled={loading}>
          <Play className="h-4 w-4" />
          {loading ? "Ejecutando..." : "Ejecutar ahora"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          En producción esto corre automáticamente cada día a las 9:00 AM
        </p>

        <div className="border-t pt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Notificaciones push</p>
          <Button variant="outline" className="w-full gap-2" onClick={handleTestPush} disabled={loadingPush}>
            <BellRing className="h-4 w-4" />
            {loadingPush ? "Enviando..." : "Probar notificación push"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Asegurate de activar el ícono de campana en la barra superior primero
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
