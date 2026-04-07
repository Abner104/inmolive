"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";
import { toast } from "sonner";

export function PerfilPanel() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/configuracion/perfil")
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setName(d.name);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
      })
      .finally(() => setFetching(false));
  }, []);

  async function guardar() {
    setLoading(true);
    try {
      const res = await fetch("/api/configuracion/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-6 space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-xl" />)}
      </CardContent>
    </Card>
  );

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-violet-500" />
          Mi perfil
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tu número de WhatsApp aparecerá en el portal de pago para que los inquilinos puedan contactarte.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled className="bg-muted/50 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp / Teléfono</Label>
          <Input
            placeholder="+56 9 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Incluí el código de país, ej: +56 para Chile, +1 para USA, +1 para RD</p>
        </div>
        <Button className="w-full gap-2" onClick={guardar} disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : "Guardar perfil"}
        </Button>
      </CardContent>
    </Card>
  );
}
