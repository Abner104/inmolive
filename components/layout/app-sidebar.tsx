"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, FileImage, Home, Users, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const items = [
  { href: "/dashboard", label: "Resumen", icon: Home, exact: true },
  { href: "/dashboard/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/dashboard/unidades", label: "Unidades", icon: Wallet },
  { href: "/dashboard/inquilinos", label: "Inquilinos", icon: Users },
  { href: "/dashboard/cobros", label: "Cobros", icon: CreditCard },
  { href: "/dashboard/comprobantes", label: "Comprobantes", icon: FileImage },
];

const bottomItems = [
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-background lg:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Image src="/logoinmio.png" alt="Inmolive" width={120} height={80} unoptimized className="object-contain" style={{ height: 40, width: "auto" }} />
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Menu</p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
