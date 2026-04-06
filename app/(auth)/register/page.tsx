"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const PAISES = [
  { value: "CLP", label: "Chile", flag: "🇨🇱", desc: "Peso chileno (CLP)" },
  { value: "DOP", label: "República Dominicana", flag: "🇩🇴", desc: "Peso dominicano (DOP)" },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [pais, setPais] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pais) {
      toast.error("Seleccioná tu país");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: form.get("email") as string,
      password,
      options: {
        data: {
          name: form.get("name") as string,
          monedaDefault: pais,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Cuenta creada. Revisá tu email para confirmar.");
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6">

        {/* Logo + título */}
        <div className="flex flex-col items-center gap-1">
          <Image
            src="/logoinmio.png"
            alt="Inmolive"
            width={240}
            height={160}
            unoptimized
            className="object-contain dark:brightness-0 dark:invert"
            style={{ height: 120, width: "auto" }}
          />
          <p className="text-sm text-muted-foreground">Creá tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de país */}
          <div className="space-y-2">
            <Label>¿Desde dónde administrás?</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAISES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPais(p.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm transition-all",
                    pais === p.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <span className="text-2xl">{p.flag}</span>
                  <span className="font-semibold text-foreground">{p.label}</span>
                  <span className="text-xs text-muted-foreground">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Tu nombre" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
