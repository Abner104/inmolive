import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUser } from "@/lib/auth/get-user";
import { WhatsAppPanel } from "./whatsapp-panel";
import { NotificacionesPanel } from "./notificaciones-panel";
import { CuentaPanel } from "./cuenta-panel";
import { PerfilPanel } from "./perfil-panel";
import { Settings } from "lucide-react";

export default async function ConfiguracionPage() {
  await getUser();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Configuración
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Administrá las integraciones del sistema</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <PerfilPanel />
            <CuentaPanel />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <WhatsAppPanel />
            <NotificacionesPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
