"use client";

import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton({ cobroId }: { cobroId: string }) {
  function handleCopy() {
    const url = `${window.location.origin}/pagar/${cobroId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado al portapapeles");
  }

  return (
    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleCopy}>
      <Link2 className="h-3 w-3" />
      Copiar link
    </Button>
  );
}
