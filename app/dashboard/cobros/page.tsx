import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCobros } from "@/lib/db/cobros";
import { getUser } from "@/lib/auth/get-user";
import { Badge } from "@/components/ui/badge";
import { formatFecha } from "@/lib/utils/fecha";
import { CreditCard } from "lucide-react";
import { GenerarCobrosButton } from "./generar-cobros-button";
import { PagarEfectivoButton } from "./pagar-efectivo-button";
import { CopyLinkButton } from "./copy-link-button";
import { CobroManualButton } from "@/components/acciones/cobro-manual-button";
import { WhatsAppButton } from "@/components/acciones/whatsapp-button";

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  PENDING: { label: "Pendiente", variant: "secondary", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400" },
  PAID:    { label: "Pagado",    variant: "default",   color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400" },
  LATE:    { label: "Atrasado",  variant: "destructive", color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400" },
  REVIEW:  { label: "En revisión", variant: "outline", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400" },
};

export default async function CobrosPage() {
  const user = await getUser();
  const cobros = await getCobros({ userId: user.id });

  const resumen = {
    total: cobros.length,
    pendientes: cobros.filter((c) => c.status === "PENDING").length,
    pagados: cobros.filter((c) => c.status === "PAID").length,
    atrasados: cobros.filter((c) => c.status === "LATE").length,
    enRevision: cobros.filter((c) => c.status === "REVIEW").length,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Cobros</h2>
              <p className="text-sm text-muted-foreground">{resumen.total} cobros en total</p>
            </div>
            <div className="flex items-center gap-2">
              <CobroManualButton />
              <GenerarCobrosButton />
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pendientes", value: resumen.pendientes, color: "text-yellow-600" },
              { label: "En revisión", value: resumen.enRevision, color: "text-blue-600" },
              { label: "Atrasados",  value: resumen.atrasados,  color: "text-red-600" },
              { label: "Pagados",    value: resumen.pagados,    color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          {cobros.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-muted-foreground/50">
              <CreditCard className="mb-3 h-12 w-12" />
              <p className="font-medium">No hay cobros generados</p>
              <p className="text-sm mt-1">Presioná "Generar cobros" para comenzar</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Inquilino</th>
                    <th className="px-5 py-3.5 text-left">Unidad</th>
                    <th className="px-5 py-3.5 text-left">Periodo</th>
                    <th className="px-5 py-3.5 text-right">Monto</th>
                    <th className="px-5 py-3.5 text-left">Vencimiento</th>
                    <th className="px-5 py-3.5 text-left">Estado</th>
                    <th className="px-5 py-3.5 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cobros.map((c) => {
                    const est = estadoConfig[c.status] ?? estadoConfig.PENDING;
                    return (
                      <tr key={c.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium">{c.tenant.fullName}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{c.unit.name}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{c.period}</td>
                        <td className="px-5 py-3.5 text-right font-semibold">
                          {c.unit.currency} {c.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{formatFecha(c.dueDate)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${est.color}`}>
                            {est.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <WhatsAppButton
                              phone={c.tenant.phone}
                              mensaje={`Hola ${c.tenant.fullName.split(" ")[0]}, te recordamos que tu cobro de ${c.unit.currency} ${c.amount.toLocaleString()} por el período ${c.period} vence el ${new Date(c.dueDate).toLocaleDateString("es-CL")}. Podés pagar aquí: ${process.env.NEXT_PUBLIC_APP_URL}/pagar/${c.id}`}
                              size="icon"
                            />
                            <CopyLinkButton cobroId={c.id} />
                            {(c.status === "PENDING" || c.status === "LATE") && (
                              <PagarEfectivoButton cobroId={c.id} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
