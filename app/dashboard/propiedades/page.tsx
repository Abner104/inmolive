import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getPropiedades } from "@/lib/db/propiedades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, Landmark } from "lucide-react";
import { PropiedadDialog } from "./propiedad-dialog";
import { getUser } from "@/lib/auth/get-user";

const tipoLabel: Record<string, string> = { HOUSE: "Casa", BUILDING: "Edificio", CONDO: "Condominio" };
const tipoIcon: Record<string, React.ReactNode> = {
  HOUSE: <Home className="h-5 w-5" />,
  BUILDING: <Building2 className="h-5 w-5" />,
  CONDO: <Landmark className="h-5 w-5" />,
};

export default async function PropiedadesPage() {
  const user = await getUser();
  const propiedades = await getPropiedades(user.id);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Propiedades</h2>
            <PropiedadDialog />
          </div>
          {propiedades.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-muted-foreground/60">
              <Building2 className="mb-3 h-10 w-10" />
              <p className="text-sm">No tenés propiedades registradas</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {propiedades.map((p) => (
                <Card key={p.id} className="rounded-3xl shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-muted-foreground">
                      {tipoIcon[p.type] ?? <Building2 className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate text-base">{p.name}</CardTitle>
                      <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                    </div>
                    <Badge variant="secondary">{tipoLabel[p.type] ?? p.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {p.units.length} unidad{p.units.length !== 1 ? "es" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
