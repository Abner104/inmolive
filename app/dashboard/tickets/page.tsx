import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { prisma } from "@/lib/db/prisma";
import { getUser } from "@/lib/auth/get-user";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { formatFecha } from "@/lib/utils/fecha";
import { TicketAcciones } from "./ticket-acciones";

const statusConfig: Record<string, { label: string; color: string }> = {
  ABIERTO:    { label: "Abierto",     color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400" },
  EN_PROCESO: { label: "En proceso",  color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400" },
  RESUELTO:   { label: "Resuelto",    color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400" },
};

const categoriaIcon: Record<string, string> = {
  plomeria: "🔧", electricidad: "⚡", limpieza: "🧹", otro: "📋",
};

const prioridadConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  baja:   { label: "Baja",   variant: "secondary" },
  normal: { label: "Normal", variant: "outline" },
  alta:   { label: "Alta",   variant: "destructive" },
};

export default async function TicketsPage() {
  const user = await getUser();

  const tickets = await prisma.ticket.findMany({
    where: { unit: { property: { userId: user.id } } },
    include: { tenant: true, unit: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });

  const abiertos = tickets.filter(t => t.status === "ABIERTO").length;
  const enProceso = tickets.filter(t => t.status === "EN_PROCESO").length;
  const resueltos = tickets.filter(t => t.status === "RESUELTO").length;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Tickets de mantenimiento</h2>
              <p className="text-sm text-muted-foreground">Reportes enviados por tus inquilinos</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Abiertos</p>
              <p className="text-2xl font-bold text-red-600">{abiertos}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">En proceso</p>
              <p className="text-2xl font-bold text-yellow-600">{enProceso}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Resueltos</p>
              <p className="text-2xl font-bold text-green-600">{resueltos}</p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-muted-foreground/50">
              <Wrench className="mb-3 h-12 w-12" />
              <p className="font-medium">No hay tickets todavía</p>
              <p className="text-sm mt-1">Los inquilinos pueden reportar problemas desde su portal de pago</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => {
                const sc = statusConfig[t.status] ?? statusConfig.ABIERTO;
                const pc = prioridadConfig[t.prioridad] ?? prioridadConfig.normal;
                return (
                  <div key={t.id} className="rounded-2xl border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{categoriaIcon[t.categoria] ?? "📋"}</span>
                        <div>
                          <p className="font-semibold">{t.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.tenant.fullName} · {t.unit.property.name} / {t.unit.name} · {formatFecha(t.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${sc.color}`}>
                          {sc.label}
                        </span>
                        <Badge variant={pc.variant} className="text-xs">{pc.label}</Badge>
                        <TicketAcciones ticket={{ id: t.id, status: t.status, comentario: t.comentario }} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                      {t.descripcion}
                    </p>
                    {t.comentario && (
                      <div className="rounded-xl border-l-2 border-primary pl-3 py-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Tu respuesta:</p>
                        <p className="text-sm">{t.comentario}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
