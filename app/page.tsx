"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, MessageCircle, CreditCard, ArrowRight, Check } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const features = [
  {
    icon: Building2,
    title: "Propiedades y unidades",
    desc: "Organizá edificios, casas y departamentos con sus inquilinos en un solo lugar.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp automático",
    desc: "Bienvenida al entrar, aviso 5 días antes del vencimiento y recordatorio al día siguiente.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: CreditCard,
    title: "Portal de pago",
    desc: "El inquilino paga por link, sube su comprobante y vos lo aprobás desde el panel.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const paises = [
  {
    flag: (
      <svg viewBox="0 0 900 600" className="h-5 w-7 rounded-sm shadow-sm">
        <rect width="900" height="600" fill="#d52b1e"/>
        <rect width="900" height="400" fill="#fff"/>
        <rect width="900" height="200" fill="#d52b1e"/>
      </svg>
    ),
    nombre: "Chile",
    moneda: "CLP",
  },
  {
    flag: (
      <svg viewBox="0 0 900 600" className="h-5 w-7 rounded-sm shadow-sm">
        <rect width="900" height="600" fill="#002D62"/>
        <rect width="900" height="400" fill="#fff"/>
        <rect width="900" height="200" fill="#CE1126"/>
        <rect x="0" y="200" width="300" height="200" fill="#002D62"/>
      </svg>
    ),
    nombre: "Rep. Dominicana",
    moneda: "DOP",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Image
          src="/logoinmio.png"
          alt="Inmolive"
          width={180}
          height={120}
          unoptimized
          className="object-contain brightness-0 invert"
          style={{ height: 38, width: "auto" }}
        />
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-slate-300 hover:text-white hover:bg-white/10">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold">
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-12 pb-24 text-center">

        {/* Badge países */}
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 backdrop-blur-sm"
        >
          {paises.map((p) => (
            <span key={p.nombre} className="flex items-center gap-1.5">
              {p.flag}
              <span>{p.nombre}</span>
            </span>
          ))}
        </motion.div>

        {/* Logo hero */}
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Image
            src="/logoinmio.png"
            alt="Inmolive"
            width={480}
            height={320}
            unoptimized
            className="object-contain brightness-0 invert"
            style={{ height: 110, width: "auto" }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]"
        >
          Cobros de arriendo,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            sin el caos
          </span>
        </motion.h1>

        <motion.p
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 max-w-xl text-lg text-slate-400 leading-relaxed"
        >
          Inquilinos, cobros mensuales, comprobantes y recordatorios por WhatsApp — todo automatizado en un panel simple.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="rounded-2xl px-8 text-base bg-white text-slate-900 hover:bg-slate-100 font-semibold gap-2">
            <Link href="/register">
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 text-base">
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-sm text-slate-500"
        >
          <Check className="h-4 w-4 text-green-500" />
          <span>Gratis para empezar · Sin tarjeta de crédito</span>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={fade} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 grid gap-4 sm:grid-cols-3 text-left w-full"
        >
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 space-y-3 hover:bg-white/[0.07] transition-colors backdrop-blur-sm"
            >
              <div className={`inline-flex rounded-xl p-2.5 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
