"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UnidadForm } from "@/components/forms/unidad-form";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Propiedad {
  id: string;
  name: string;
}

interface Props {
  propiedades: Propiedad[];
}

export function UnidadDialog({ propiedades }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva unidad
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva unidad</DialogTitle>
        </DialogHeader>
        <UnidadForm
          propiedades={propiedades}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
