import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Image
          src="/logoinmio.png"
          alt="Inmolive"
          width={180}
          height={120}
          unoptimized
          className="object-contain"
          style={{ height: 40, width: "auto" }}
        />
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-slate-300 hover:text-white">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-4xl flex-col items-center justify-center px-6 pb-16 text-center">

        {/* Badge países */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
          <span>🇨🇱</span><span>🇩🇴</span>
          <span>Chile · República Dominicana</span>
        </div>

        {/* Logo grande */}
        <Image
          src="/logoinmio.png"
          alt="Inmolive"
          width={480}
          height={320}
          unoptimized
          className="object-contain mb-6"
          style={{ height: 120, width: "auto" }}
        />

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
          Administrá propiedades<br className="hidden sm:block" /> y cobros en un solo lugar
        </h1>
        <p className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
          Inquilinos, cobros mensuales, comprobantes de pago y recordatorios automáticos por WhatsApp — todo sin complicaciones.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-2xl px-10 text-base">
            <Link href="/register">Comenzar gratis</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 text-base">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-4 sm:grid-cols-3 text-left w-full">
          {[
            { icon: "🏢", title: "Propiedades y unidades", desc: "Organizá edificios, casas y departamentos con sus inquilinos." },
            { icon: "📲", title: "WhatsApp automático", desc: "Bienvenida, avisos de vencimiento y recordatorios sin hacer nada." },
            { icon: "💳", title: "Portal de pago", desc: "El inquilino paga por link y sube su comprobante. Vos lo aprobás." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2 hover:bg-white/[0.08] transition-colors">
              <span className="text-3xl">{icon}</span>
              <p className="font-semibold text-base">{title}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
