import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerificarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-3xl border bg-card shadow-sm p-8 space-y-6 text-center">

        <div className="flex flex-col items-center gap-1">
          <Image
            src="/logoinmio.png"
            alt="Inmolive"
            width={240}
            height={160}
            unoptimized
            className="object-contain brightness-0 dark:brightness-100"
            style={{ height: 80, width: "auto" }}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Revisá tu correo</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Te enviamos un link de confirmación. Hacé click en el link del email para activar tu cuenta.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-muted/50 p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-foreground">¿No lo encontrás?</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Revisá la carpeta de spam o correo no deseado</li>
            <li>• El email llega en menos de 2 minutos</li>
            <li>• Asegurate de haber ingresado el correo correcto</li>
          </ul>
        </div>

        <Button asChild variant="outline" className="w-full rounded-2xl">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    </div>
  );
}
