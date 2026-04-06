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

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6">

        {/* Logo + título */}
        <div className="flex flex-col items-center gap-1">
          <Image
            src="/logoinmio.png"
            alt="Inmolive"
            width={240}
            height={160}
            unoptimized
            className="object-contain"
            style={{ height: 140, width: "auto" }}
          />
          <p className="text-sm text-muted-foreground">Ingresá a tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
