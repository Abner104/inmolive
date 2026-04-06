import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl border bg-card p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-16" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6 xl:col-span-2 space-y-4">
              <Skeleton className="h-5 w-36" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
            <div className="rounded-3xl border bg-card p-6 space-y-3">
              <Skeleton className="h-5 w-28" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
