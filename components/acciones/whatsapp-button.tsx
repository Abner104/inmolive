"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  phone: string;
  mensaje: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
  label?: string;
}

export function WhatsAppButton({ phone, mensaje, variant = "ghost", size = "sm", label }: Props) {
  function handleClick() {
    const numero = phone.replace(/\D/g, "");
    if (!numero) { toast.error("El inquilino no tiene teléfono registrado"); return; }
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  }

  if (size === "icon") {
    return (
      <Button variant={variant} size="icon" className="h-8 w-8 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleClick}>
        <MessageCircle className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleClick}>
      <MessageCircle className="h-4 w-4" />
      {label ?? "WhatsApp"}
    </Button>
  );
}
