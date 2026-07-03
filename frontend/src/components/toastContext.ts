import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast duhet përdorur brenda ToastProvider");
  return ctx;
}
