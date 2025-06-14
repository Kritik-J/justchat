import React from "react";
import { Loader, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({
  className,
  type = "1",
  size = 16,
}: {
  className?: string;
  type?: "1" | "2";
  size?: number;
}) {
  return type === "1" ? (
    <Loader className={cn("animate-spin", className)} size={size} />
  ) : (
    <Loader2 className={cn("animate-spin", className)} size={size} />
  );
}
