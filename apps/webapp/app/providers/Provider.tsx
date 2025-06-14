import { Toaster } from "@justchat/ui/components/sonner";
import React from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster richColors />
      {children}
    </>
  );
}
