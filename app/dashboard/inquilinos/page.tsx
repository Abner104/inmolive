import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getInquilinos } from "@/lib/db/inquilinos";
import { getUser } from "@/lib/auth/get-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail } from "lucide-react";
import { formatFecha } from "@/lib/utils/fecha";
import { InquilinoDialog } from "./inquilino-dialog";

export default async function InquilinosPage() {
  const user = await getUser();
  const inquilinos = await getInquilinos({ userId: user.id });

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Inquilinos</h2>
            <InquilinoDialog />
          </div>
          {inquilinos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-muted-foreground/60">
              <Users className="mb-3 h-10 w-10" />
              <p className="text-sm">No hay inquilinos registrados</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {inquilinos.map((i) => (
                <Card key={i.id} className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{i.fullName}</CardTitle>
                      <Badge variant={i.active ? "default" : "secondary"}>
                        {i.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {i.unit.property.name} — {i.unit.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {i.phone}
                    </div>
                    {i.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {i.email}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      Desde {formatFecha(i.contractStartDate)}
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
