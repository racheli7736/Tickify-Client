import { createContext } from 'react';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export interface ToastApi {
  show: (message: string, severity?: ToastSeverity) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
