"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, Upload, Banknote, ArrowLeftRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const MONEDAS = [
  { value: "CLP", label: "🇨🇱 CLP — Peso chileno" },
  { value: "USD", label: "🇺🇸 USD — Dólar" },
  { value: "DOP", label: "🇩🇴 DOP — Peso dominicano" },
] as const;

interface CuentaPago {
  moneda: string;
  titular: string;
  email?: string | null;
  instrucciones?: string | null;
  banco?: string | null;
  tipoCuenta?: string | null;
  numeroCuenta?: string | null;
  documento?: string | null;
  metodoUSD?: string | null;
  zellePhone?: string | null;
  paypalEmail?: string | null;
}

interface Props {
  cobroId: string;
  monedaBase: string;
  montoBase: number;
  cuentas: CuentaPago[];
}

type MetodoPago = "transferencia" | "efectivo";

export function PagarForm({ cobroId, monedaBase, montoBase, cuentas }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago>("transferencia");
  const [moneda, setMoneda] = useState(monedaBase);
  const [archivo, setArchivo] = useState<File | null>(null);

  const cuenta = cuentas.find((c) => c.moneda === moneda) ?? null;

  function copiar(texto: string, label: string) {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (metodo === "transferencia" && !archivo) {
      toast.error("Seleccioná el comprobante de transferencia");
      return;
    }
    setLoading(true);
    try {
      let fileUrl = "";
      let fileName = metodo === "efectivo" ? "Efectivo" : "";

      if (metodo === "transferencia" && archivo) {
        const uploadForm = new FormData();
        uploadForm.append("file", archivo);
        uploadForm.append("cobroId", cobroId);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) throw new Error("Error al subir archivo");
        const data = await uploadRes.json();
        fileUrl = data.url;
        fileName = data.fileName;
      }

      const res = await fetch("/api/comprobantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cobroId, fileUrl, fileName: `[${metodo.toUpperCase()}] ${fileName}` }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      toast.error("Error al enviar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card p-8 text-center shadow-sm">
        <CheckCircle className="h-14 w-14 text-green-500" />
        <h2 className="text-lg font-bold">¡Listo!</h2>
        <p className="text-sm text-muted-foreground">
          {metodo === "transferencia"
            ? "Tu comprobante fue enviado y está siendo revisado por el administrador."
            : "Tu pago en efectivo fue registrado. El administrador lo confirmará pronto."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de método */}
      <div className="grid grid-cols-2 gap-3">
        {(["transferencia", "efectivo"] as MetodoPago[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetodo(m)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-all",
              metodo === m
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            )}
          >
            {m === "transferencia" ? <ArrowLeftRight className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
            {m === "transferencia" ? "Transferencia" : "Efectivo"}
          </button>
        ))}
      </div>

      {/* Selector de moneda + monto */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Moneda de pago</Label>
          <Select value={moneda} onValueChange={setMoneda}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONEDAS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Monto</Label>
          <Input
            name="monto"
            readOnly
            value={`${monedaBase} ${montoBase.toLocaleString()}`}
            className="bg-muted/50 text-foreground font-semibold"
          />
        </div>
      </div>

      {/* Datos de transferencia */}
      {metodo === "transferencia" && (
        <div className="space-y-3">
          {cuenta ? (
            <DatosCuenta cuenta={cuenta} copiar={copiar} />
          ) : (
            <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              El administrador no configuró los datos de transferencia para {moneda} aún.
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Subir comprobante</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-sm text-muted-foreground transition hover:bg-muted/50">
              <Upload className="h-5 w-5" />
              {archivo ? (
                <span className="font-medium text-foreground">{archivo.name}</span>
              ) : (
                <span>Imagen o PDF del comprobante</span>
              )}
              <input type="file" className="hidden" accept="image/*,.pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      )}

      {/* Instrucciones efectivo */}
      {metodo === "efectivo" && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 text-sm space-y-2">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Instrucciones para pago en efectivo:</p>
          <ul className="space-y-1 text-amber-700 dark:text-amber-400 list-disc list-inside">
            <li>Coordinar el pago directamente con el administrador</li>
            <li>Exigir recibo o comprobante al momento del pago</li>
            <li>Conservar el comprobante como respaldo</li>
          </ul>
          {cuenta?.instrucciones && (
            <p className="mt-2 text-amber-700 dark:text-amber-400 border-t border-amber-200 dark:border-amber-800 pt-2">
              {cuenta.instrucciones}
            </p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading || (metodo === "transferencia" && !archivo)}>
        {loading ? "Enviando..." : metodo === "transferencia" ? "Enviar comprobante" : "Notificar pago en efectivo"}
      </Button>
    </form>
  );
}

// ── Subcomponente: muestra datos según tipo de cuenta ──
function DatosCuenta({ cuenta, copiar }: { cuenta: CuentaPago; copiar: (v: string, l: string) => void }) {
  const filas: { label: string; value: string }[] = [];

  if (cuenta.moneda === "USD") {
    const metodo = cuenta.metodoUSD ?? "banco";
    if (metodo === "zelle") {
      filas.push({ label: "Titular", value: cuenta.titular });
      if (cuenta.zellePhone) filas.push({ label: "Zelle (teléfono/email)", value: cuenta.zellePhone });
    } else if (metodo === "paypal") {
      filas.push({ label: "Titular", value: cuenta.titular });
      if (cuenta.paypalEmail) filas.push({ label: "Email PayPal", value: cuenta.paypalEmail });
    } else {
      // banco USD
      if (cuenta.banco) filas.push({ label: "Banco", value: cuenta.banco });
      if (cuenta.tipoCuenta) filas.push({ label: "Tipo de cuenta", value: cuenta.tipoCuenta });
      if (cuenta.numeroCuenta) filas.push({ label: "N° de cuenta", value: cuenta.numeroCuenta });
      filas.push({ label: "Titular", value: cuenta.titular });
      if (cuenta.documento) filas.push({ label: "Documento", value: cuenta.documento });
    }
  } else {
    // CLP / DOP
    if (cuenta.banco) filas.push({ label: "Banco", value: cuenta.banco });
    if (cuenta.tipoCuenta) filas.push({ label: "Tipo de cuenta", value: cuenta.tipoCuenta });
    if (cuenta.numeroCuenta) filas.push({ label: "N° de cuenta", value: cuenta.numeroCuenta });
    filas.push({ label: "Titular", value: cuenta.titular });
    if (cuenta.documento) {
      const docLabel = cuenta.moneda === "CLP" ? "RUT" : "Cédula";
      filas.push({ label: docLabel, value: cuenta.documento });
    }
  }

  if (cuenta.email) filas.push({ label: "Email", value: cuenta.email });

  return (
    <div className="rounded-2xl border bg-muted/30 p-4 space-y-2.5 text-sm">
      <p className="font-semibold text-foreground mb-3">Datos para transferir ({cuenta.moneda}):</p>
      {filas.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-muted-foreground">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{value}</span>
            <button type="button" onClick={() => copiar(value, label)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      {cuenta.instrucciones && (
        <p className="mt-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 p-3 text-xs text-yellow-800 dark:text-yellow-300">
          {cuenta.instrucciones}
        </p>
      )}
    </div>
  );
}
