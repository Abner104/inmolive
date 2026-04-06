"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Save } from "lucide-react";
import { toast } from "sonner";

type Moneda = "CLP" | "USD" | "DOP";

interface CuentaForm {
  titular: string;
  email: string;
  instrucciones: string;
  // CLP / DOP
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  documento: string;
  // USD
  metodoUSD: string;
  zellePhone: string;
  paypalEmail: string;
}

const EMPTY: CuentaForm = {
  titular: "", email: "", instrucciones: "",
  banco: "", tipoCuenta: "Cuenta Corriente", numeroCuenta: "", documento: "",
  metodoUSD: "banco", zellePhone: "", paypalEmail: "",
};

export function CuentaPanel() {
  const [monedaDefault, setMonedaDefault] = useState<Moneda>("CLP");
  const [cuentas, setCuentas] = useState<Record<Moneda, CuentaForm>>({ CLP: { ...EMPTY }, USD: { ...EMPTY }, DOP: { ...EMPTY } });
  const [loading, setLoading] = useState<Moneda | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/configuracion/cuenta")
      .then((r) => r.json())
      .then(({ cuentas: data, monedaDefault: md }) => {
        if (md) setMonedaDefault(md);
        if (data) {
          const map = { CLP: { ...EMPTY }, USD: { ...EMPTY }, DOP: { ...EMPTY } } as Record<Moneda, CuentaForm>;
          for (const c of data) map[c.moneda as Moneda] = { ...EMPTY, ...c };
          setCuentas(map);
        }
      })
      .finally(() => setFetching(false));
  }, []);

  function set(moneda: Moneda, key: keyof CuentaForm, value: string) {
    setCuentas((prev) => ({ ...prev, [moneda]: { ...prev[moneda], [key]: value } }));
  }

  async function guardar(moneda: Moneda) {
    setLoading(moneda);
    try {
      const res = await fetch("/api/configuracion/cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moneda, monedaDefault, ...cuentas[moneda] }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Cuenta ${moneda} guardada`);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(null);
    }
  }

  async function guardarMonedaDefault(v: Moneda) {
    setMonedaDefault(v);
    await fetch("/api/configuracion/cuenta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monedaDefault: v }),
    });
    toast.success("Moneda predeterminada actualizada");
  }

  if (fetching) return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-6 space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-xl" />)}
      </CardContent>
    </Card>
  );

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-5 w-5 text-blue-500" />
          Cuentas de cobro
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Configurá los datos de pago para cada moneda. El inquilino verá los datos según la moneda que elija.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Moneda default */}
        <div className="rounded-2xl bg-muted/50 p-4 space-y-1.5">
          <Label>Moneda predeterminada para unidades nuevas</Label>
          <Select value={monedaDefault} onValueChange={(v) => guardarMonedaDefault(v as Moneda)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLP">CLP — Peso chileno</SelectItem>
              <SelectItem value="USD">USD — Dólar</SelectItem>
              <SelectItem value="DOP">DOP — Peso dominicano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs por moneda */}
        <Tabs defaultValue="CLP">
          <TabsList className="w-full">
            <TabsTrigger value="CLP" className="flex-1">CLP — Chile</TabsTrigger>
            <TabsTrigger value="USD" className="flex-1">USD — Dólar</TabsTrigger>
            <TabsTrigger value="DOP" className="flex-1">DOP — Dom.</TabsTrigger>
          </TabsList>

          {/* ── CLP ── */}
          <TabsContent value="CLP" className="space-y-3 pt-3">
            <FormCuentaBancaria
              moneda="CLP"
              form={cuentas.CLP}
              set={(k, v) => set("CLP", k, v)}
              documentoLabel="RUT"
              documentoPlaceholder="12.345.678-9"
              tiposCuenta={["Cuenta Corriente", "Cuenta Vista", "Cuenta RUT", "Cuenta de Ahorro"]}
            />
            <Button className="w-full gap-2" onClick={() => guardar("CLP")} disabled={loading === "CLP"}>
              <Save className="h-4 w-4" />
              {loading === "CLP" ? "Guardando..." : "Guardar cuenta CLP"}
            </Button>
          </TabsContent>

          {/* ── USD ── */}
          <TabsContent value="USD" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label>Método de pago</Label>
              <Select value={cuentas.USD.metodoUSD} onValueChange={(v) => set("USD", "metodoUSD", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banco">Transferencia bancaria</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cuentas.USD.metodoUSD === "banco" && (
              <FormCuentaBancaria
                moneda="USD"
                form={cuentas.USD}
                set={(k, v) => set("USD", k, v)}
                documentoLabel="Documento"
                documentoPlaceholder="ID / Pasaporte"
                tiposCuenta={["Checking", "Savings"]}
              />
            )}
            {cuentas.USD.metodoUSD === "zelle" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Titular</Label>
                  <Input placeholder="Nombre completo" value={cuentas.USD.titular} onChange={(e) => set("USD", "titular", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono o email Zelle</Label>
                  <Input placeholder="+1 (555) 000-0000" value={cuentas.USD.zellePhone} onChange={(e) => set("USD", "zellePhone", e.target.value)} />
                </div>
              </div>
            )}
            {cuentas.USD.metodoUSD === "paypal" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Titular</Label>
                  <Input placeholder="Nombre completo" value={cuentas.USD.titular} onChange={(e) => set("USD", "titular", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email PayPal</Label>
                  <Input type="email" placeholder="pagos@email.com" value={cuentas.USD.paypalEmail} onChange={(e) => set("USD", "paypalEmail", e.target.value)} />
                </div>
              </div>
            )}

            <CamposComunes moneda="USD" form={cuentas.USD} set={(k, v) => set("USD", k, v)} />
            <Button className="w-full gap-2" onClick={() => guardar("USD")} disabled={loading === "USD"}>
              <Save className="h-4 w-4" />
              {loading === "USD" ? "Guardando..." : "Guardar cuenta USD"}
            </Button>
          </TabsContent>

          {/* ── DOP ── */}
          <TabsContent value="DOP" className="space-y-3 pt-3">
            <FormCuentaBancaria
              moneda="DOP"
              form={cuentas.DOP}
              set={(k, v) => set("DOP", k, v)}
              documentoLabel="Cédula"
              documentoPlaceholder="000-0000000-0"
              tiposCuenta={["Cuenta Corriente", "Cuenta de Ahorro", "Cuenta Nómina"]}
            />
            <Button className="w-full gap-2" onClick={() => guardar("DOP")} disabled={loading === "DOP"}>
              <Save className="h-4 w-4" />
              {loading === "DOP" ? "Guardando..." : "Guardar cuenta DOP"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ── Subcomponente: formulario bancario genérico ──
function FormCuentaBancaria({ form, set, documentoLabel, documentoPlaceholder, tiposCuenta }: {
  moneda: Moneda;
  form: CuentaForm;
  set: (k: keyof CuentaForm, v: string) => void;
  documentoLabel: string;
  documentoPlaceholder: string;
  tiposCuenta: string[];
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Banco</Label>
          <Input placeholder="Nombre del banco" value={form.banco} onChange={(e) => set("banco", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de cuenta</Label>
          <Select value={form.tipoCuenta} onValueChange={(v) => set("tipoCuenta", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {tiposCuenta.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>N° de cuenta</Label>
        <Input placeholder="0000000000" value={form.numeroCuenta} onChange={(e) => set("numeroCuenta", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Titular</Label>
          <Input placeholder="Nombre completo" value={form.titular} onChange={(e) => set("titular", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{documentoLabel}</Label>
          <Input placeholder={documentoPlaceholder} value={form.documento} onChange={(e) => set("documento", e.target.value)} />
        </div>
      </div>
      <CamposComunes moneda={"CLP"} form={form} set={set} />
    </div>
  );
}

function CamposComunes({ form, set }: { moneda: Moneda; form: CuentaForm; set: (k: keyof CuentaForm, v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Email de confirmación <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <Input type="email" placeholder="pagos@tuempresa.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Instrucciones adicionales <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <Textarea placeholder="Ej: Enviar el comprobante por WhatsApp al recibir..." value={form.instrucciones} onChange={(e) => set("instrucciones", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
