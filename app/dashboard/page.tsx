import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getResumenCobros } from "@/lib/db/cobros";
import { prisma } from "@/lib/db/prisma";
import { getUser } from "@/lib/auth/get-user";

export default async function DashboardPage() {
  const user = await getUser();
  const [resumen, unidades, cobrosRecientes] = await Promise.all([
    getResumenCobros(user.id),
    prisma.unit.findMany({
      where: { property: { userId: user.id } },
      select: { status: true },
    }),
    prisma.charge.findMany({
      where: { property: { userId: user.id } },
      include: { tenant: true, unit: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const ocupadas = unidades.filter((u) => u.status === "OCCUPIED").length;
  const disponibles = unidades.filter((u) => u.status === "AVAILABLE").length;

  const stats = [
    { title: "Pagos recibidos", value: resumen.pagados },
    { title: "Pendientes", value: resumen.pendientes },
    { title: "En revisión", value: resumen.enRevision },
    { title: "Atrasados", value: resumen.atrasados },
  ];

  const estadoLabel: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    LATE: "Atrasado",
    REVIEW: "En revisión",
  };
  const estadoVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    PAID: "default",
    LATE: "destructive",
    REVIEW: "outline",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-3">
            <Card className="rounded-3xl xl:col-span-2">
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {cobrosRecientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60">Sin actividad reciente</p>
                ) : (
                  <div className="space-y-3">
                    {cobrosRecientes.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <p className="text-sm font-medium">{c.tenant.fullName}</p>
                          <p className="text-xs text-muted-foreground">{c.unit.name} — {c.period}</p>
                        </div>
                        <Badge variant={estadoVariant[c.status] ?? "secondary"}>
                          {estadoLabel[c.status] ?? c.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Estado general</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Unidades ocupadas: <span className="font-semibold text-slate-900">{ocupadas}</span></p>
                  <p>Unidades disponibles: <span className="font-semibold text-slate-900">{disponibles}</span></p>
                  <p>Morosidad: <span className="font-semibold text-red-600">{resumen.atrasados} unidad{resumen.atrasados !== 1 ? "es" : ""}</span></p>
                  <p>Total cobros: <span className="font-semibold text-slate-900">{resumen.total}</span></p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
