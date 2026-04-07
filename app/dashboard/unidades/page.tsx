import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUser } from "@/lib/auth/get-user";
import { getPropiedades } from "@/lib/db/propiedades";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { UnidadDialog } from "./unidad-dialog";
import { UnidadAcciones } from "@/components/acciones/unidad-acciones";

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OCCUPIED: { label: "Ocupada", variant: "default" },
  AVAILABLE: { label: "Disponible", variant: "secondary" },
  MAINTENANCE: { label: "Mantenimiento", variant: "destructive" },
};

export default async function UnidadesPage() {
  const user = await getUser();
  const propiedades = await getPropiedades(user.id);

  const unidades = await prisma.unit.findMany({
    where: { property: { userId: user.id } },
    include: {
      property: true,
      tenants: { where: { active: true }, take: 1 },
    },
    orderBy: [{ propertyId: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Unidades</h2>
            <UnidadDialog propiedades={propiedades} />
          </div>
          {unidades.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-muted-foreground/60">
              <Wallet className="mb-3 h-10 w-10" />
              <p className="text-sm">No hay unidades registradas</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {unidades.map((u) => {
                const est = estadoConfig[u.status] ?? { label: u.status, variant: "secondary" as const };
                const inquilino = u.tenants[0];
                const esDiario = u.rentalType === "DAILY";
                return (
                  <Card key={u.id} className="rounded-3xl shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{u.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {u.property.name}{u.floor ? ` · Piso ${u.floor}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={est.variant}>{est.label}</Badge>
                        <UnidadAcciones unidad={{
                          id: u.id, name: u.name, floor: u.floor,
                          rentPrice: u.rentPrice, currency: u.currency,
                          dueDayOfMonth: u.dueDayOfMonth, status: u.status,
                          rentalType: u.rentalType,
                        }} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        {u.currency} {u.rentPrice.toLocaleString()}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          {esDiario ? "/ día" : "/ mes"}
                        </span>
                      </p>
                      {!esDiario && (
                        <p>Vence día <span className="font-medium text-foreground">{u.dueDayOfMonth}</span></p>
                      )}
                      {esDiario && (
                        <Badge variant="outline" className="text-xs">Alquiler por día/noche</Badge>
                      )}
                      {inquilino && (
                        <p className="truncate">
                          Inquilino: <span className="font-medium text-foreground">{inquilino.fullName}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
