import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUser } from "@/lib/auth/get-user";
import { getComprobantes } from "@/lib/db/comprobantes";
import { Badge } from "@/components/ui/badge";
import { FileImage, ExternalLink } from "lucide-react";
import { RevisarButtons } from "./revisar-buttons";

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  APPROVED: { label: "Aprobado", variant: "default" },
  REJECTED: { label: "Rechazado", variant: "destructive" },
};

export default async function ComprobantesPage() {
  const user = await getUser();
  const comprobantes = await getComprobantes({ userId: user.id });

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Comprobantes</h2>
            <Badge variant="secondary">{comprobantes.length} total</Badge>
          </div>
          {comprobantes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-muted-foreground/60">
              <FileImage className="mb-3 h-10 w-10" />
              <p className="text-sm">No hay comprobantes enviados</p>
            </div>
          ) : (
            <>
              {/* Tabla — solo desktop */}
              <div className="hidden md:block overflow-hidden rounded-3xl border bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted text-xs font-medium text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Inquilino</th>
                      <th className="px-4 py-3 text-left">Unidad</th>
                      <th className="px-4 py-3 text-left">Periodo</th>
                      <th className="px-4 py-3 text-left">Archivo</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {comprobantes.map((c) => {
                      const est = estadoConfig[c.status] ?? { label: c.status, variant: "secondary" as const };
                      return (
                        <tr key={c.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{c.charge.tenant.fullName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.charge.unit.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.charge.period}</td>
                          <td className="px-4 py-3">
                            <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:underline">
                              <ExternalLink className="h-3.5 w-3.5" />
                              {c.fileName}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={est.variant}>{est.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {c.status === "PENDING" && <RevisarButtons comprobanteId={c.id} />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards — solo móvil */}
              <div className="md:hidden space-y-3">
                {comprobantes.map((c) => {
                  const est = estadoConfig[c.status] ?? { label: c.status, variant: "secondary" as const };
                  return (
                    <div key={c.id} className="rounded-2xl border bg-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{c.charge.tenant.fullName}</p>
                          <p className="text-xs text-muted-foreground">{c.charge.unit.name} · {c.charge.period}</p>
                        </div>
                        <Badge variant={est.variant} className="shrink-0">{est.label}</Badge>
                      </div>
                      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline truncate">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{c.fileName}</span>
                      </a>
                      {c.status === "PENDING" && (
                        <div className="pt-1">
                          <RevisarButtons comprobanteId={c.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
