"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <Image src="/logoinmio.png" alt="Inmolive" width={240} height={160} unoptimized
              className="object-contain brightness-0 dark:brightness-100" style={{ height: 80, width: "auto" }} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">Revisá tu correo</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de entrada.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-foreground">¿No lo encontrás?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Revisá la carpeta de spam</li>
              <li>• El link expira en 1 hora</li>
            </ul>
          </div>
          <Button asChild variant="outline" className="w-full rounded-2xl">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6">

        <div className="flex flex-col items-center gap-1">
          <Image src="/logoinmio.png" alt="Inmolive" width={240} height={160} unoptimized
            className="object-contain brightness-0 dark:brightness-100" style={{ height: 100, width: "auto" }} />
          <p className="text-sm text-muted-foreground">Recuperá tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email de tu cuenta</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperación"}
          </Button>
        </form>

        <Button asChild variant="ghost" className="w-full gap-2 text-muted-foreground">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Volver al login
          </Link>
        </Button>
      </div>
    </div>
  );
}
