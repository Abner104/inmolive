"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Contraseña actualizada correctamente");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6">

        <div className="flex flex-col items-center gap-1">
          <Image src="/logoinmio.png" alt="Inmolive" width={240} height={160} unoptimized
            className="object-contain brightness-0 dark:brightness-100" style={{ height: 100, width: "auto" }} />
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground mt-1">Elegí una contraseña segura para tu cuenta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
