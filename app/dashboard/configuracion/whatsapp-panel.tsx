"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";

interface Estado {
  connected: boolean;
  qr: string | null;
}

export function WhatsAppPanel() {
  const [estado, setEstado] = useState<Estado>({ connected: false, qr: null });
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const fetchEstado = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/estado");
      const data = await res.json();
      setEstado(data);

      if (data.qr) {
        // Convertir el string QR a imagen usando qrcode
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(data.qr, { width: 256, margin: 2 });
        setQrDataUrl(url);
      } else {
        setQrDataUrl(null);
      }
    } catch {
      // silenciar error si WhatsApp no está disponible
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstado();
    // Polling cada 5 segundos para detectar cuando se conecta
    const interval = setInterval(fetchEstado, 5000);
    return () => clearInterval(interval);
  }, [fetchEstado]);

  return (
    <Card className="rounded-3xl shadow-sm max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-green-500" />
            WhatsApp
          </CardTitle>
          <Badge
            variant={estado.connected ? "default" : "secondary"}
            className={estado.connected ? "bg-green-500 hover:bg-green-500" : ""}
          >
            {estado.connected ? (
              <><Wifi className="mr-1 h-3 w-3" /> Conectado</>
            ) : (
              <><WifiOff className="mr-1 h-3 w-3" /> Desconectado</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {estado.connected ? (
          <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-4 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              WhatsApp conectado y listo para enviar recordatorios
            </p>
          </div>
        ) : qrDataUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Escaneá este código QR con tu WhatsApp para conectar la cuenta:
            </p>
            <div className="flex justify-center rounded-2xl border p-4 bg-white">
              <Image src={qrDataUrl} alt="QR WhatsApp" width={220} height={220} />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              WhatsApp → Dispositivos vinculados → Vincular dispositivo
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Presioná el botón para iniciar la conexión con WhatsApp
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={fetchEstado}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Actualizando..." : "Actualizar estado"}
        </Button>
      </CardContent>
    </Card>
  );
}
