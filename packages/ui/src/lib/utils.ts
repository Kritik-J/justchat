import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { useForm, useFormContext, type SubmitHandler } from "react-hook-form";
export { zodResolver } from "@hookform/resolvers/zod";
export { isValidPhoneNumber } from "react-phone-number-input";
