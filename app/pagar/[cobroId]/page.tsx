import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { PagarForm } from "./pagar-form";
import { CheckCircle } from "lucide-react";
import { formatFecha } from "@/lib/utils/fecha";
import Image from "next/image";

interface Props {
  params: Promise<{ cobroId: string }>;
}

export default async function PagarPage({ params }: Props) {
  const { cobroId } = await params;

  const cobro = await prisma.charge.findUnique({
    where: { id: cobroId },
    include: {
      unit: true,
      tenant: true,
      property: { include: { user: { include: { cuentas: true } } } },
      paymentProof: true,
    },
  });

  if (!cobro) notFound();

  const cuentas = cobro.property.user.cuentas;

  if (cobro.status === "PAID") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">¡Pago registrado!</h1>
          <p className="text-muted-foreground">Este cobro ya fue marcado como pagado.</p>
        </div>
      </div>
    );
  }

  if (cobro.paymentProof) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-16 w-16 text-blue-500" />
          <h1 className="text-2xl font-bold">Comprobante enviado</h1>
          <p className="text-muted-foreground">Tu comprobante está siendo revisado. Te notificaremos pronto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-5">

        {/* Header con logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Image src="/logoinmio.png" alt="Inmolive" width={240} height={160} unoptimized className="object-contain" style={{ height: 48, width: "auto" }} />
          <h1 className="text-2xl font-bold">Pagar arriendo</h1>
          <p className="text-sm text-muted-foreground">{cobro.property.name} · {cobro.unit.name}</p>
        </div>

        {/* Detalle del cobro */}
        <div className="rounded-3xl border bg-card p-5 shadow-sm space-y-2.5 text-sm">
          {[
            { label: "Inquilino", value: cobro.tenant.fullName },
            { label: "Periodo", value: cobro.period },
            { label: "Vencimiento", value: formatFecha(cobro.dueDate) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2.5">
            <span className="text-muted-foreground">Monto</span>
            <span className="text-xl font-bold">{cobro.unit.currency} {cobro.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Form de pago */}
        <PagarForm
          cobroId={cobro.id}
          monedaBase={cobro.unit.currency}
          montoBase={cobro.amount}
          cuentas={cuentas}
        />
      </div>
    </div>
  );
}
