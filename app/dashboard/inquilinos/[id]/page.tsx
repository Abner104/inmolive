import { notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";
import { getUser } from "@/lib/auth/get-user";
import { formatFecha } from "@/lib/utils/fecha";
import {
  ArrowLeft, Phone, Mail, FileText, Calendar,
  CheckCircle2, Clock, AlertTriangle, Search
} from "lucide-react";

const ESTADO_LABEL: Record<string, string> = {
  PENDING: "Pendiente", PAID: "Pagado", LATE: "Atrasado", REVIEW: "En revisión",
};
const ESTADO_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", PAID: "default", LATE: "destructive", REVIEW: "outline",
};
const ESTADO_ICON: Record<string, React.ReactNode> = {
  PAID: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  LATE: <AlertTriangle className="h-4 w-4 text-red-500" />,
  REVIEW: <Search className="h-4 w-4 text-blue-500" />,
};

function formatMoneda(amount: number, currency: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default async function InquilinoDetallePage({ params }: { params: { id: string } }) {
  const user = await getUser();

  const inquilino = await prisma.tenant.findFirst({
    where: { id: params.id, unit: { property: { userId: user.id } } },
    include: {
      unit: { include: { property: true } },
      charges: {
        include: { paymentProof: true },
        orderBy: { dueDate: "desc" },
      },
    },
  });

  if (!inquilino) notFound();

  const cobros = inquilino.charges;
  const currency = inquilino.unit.currency;

  const totalPagado = cobros.filter(c => c.status === "PAID").reduce((s, c) => s + c.amount, 0);
  const totalPendiente = cobros.filter(c => c.status === "PENDING" || c.status === "LATE").reduce((s, c) => s + c.amount, 0);
  const totalAtrasado = cobros.filter(c => c.status === "LATE").reduce((s, c) => s + c.amount, 0);

  const stats = [
    { label: "Total pagado", value: formatMoneda(totalPagado, currency), color: "text-green-600 dark:text-green-400" },
    { label: "Pendiente", value: formatMoneda(totalPendiente, currency), color: "text-yellow-600 dark:text-yellow-400" },
    { label: "Atrasado", value: formatMoneda(totalAtrasado, currency), color: "text-red-600 dark:text-red-400" },
    { label: "Total cobros", value: cobros.length.toString(), color: "text-foreground" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-xl">
              <Link href="/dashboard/inquilinos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-xl font-bold">{inquilino.fullName}</h2>
              <p className="text-sm text-muted-foreground">
                {inquilino.unit.property.name} — {inquilino.unit.name}
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant={inquilino.active ? "default" : "secondary"} className="text-xs">
                {inquilino.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Info del inquilino */}
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Datos del inquilino</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {inquilino.phone}
                </div>
                {inquilino.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {inquilino.email}
                  </div>
                )}
                {inquilino.documentId && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    {inquilino.documentId}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Desde {formatFecha(inquilino.contractStartDate)}
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                  <p>Arriendo: <span className="font-semibold text-foreground">{formatMoneda(inquilino.unit.rentPrice, currency)}</span> / mes</p>
                  <p>Vence día <span className="font-semibold text-foreground">{inquilino.unit.dueDayOfMonth}</span> de cada mes</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <Card key={s.label} className="rounded-3xl shadow-sm">
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Historial de cobros */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Historial de cobros</CardTitle>
            </CardHeader>
            <CardContent>
              {cobros.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 text-center py-8">Sin cobros registrados</p>
              ) : (
                <div className="space-y-2">
                  {cobros.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-2xl border p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {ESTADO_ICON[c.status]}
                        <div>
                          <p className="text-sm font-semibold">{formatPeriod(c.period)}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence {formatFecha(c.dueDate)}
                            {c.paymentProof && (
                              <span className="ml-2 text-blue-500">· Comprobante subido</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{formatMoneda(c.amount, currency)}</span>
                        <Badge variant={ESTADO_VARIANT[c.status] ?? "secondary"} className="text-xs">
                          {ESTADO_LABEL[c.status] ?? c.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
