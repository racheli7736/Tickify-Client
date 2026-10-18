import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { ToastContext, type ToastSeverity } from './toastContext';

interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

/** One place that shows short confirmations ("the order was cancelled") for every screen. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((message: string, severity: ToastSeverity = 'success') => {
    setToast({ id: Date.now(), message, severity });
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={toast?.id}
        open={toast !== null}
        autoHideDuration={4500}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        // Top, just under the sticky navigation bar: it never covers the row buttons or the mobile booking bar.
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: '82px !important', md: '90px !important' } }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ minWidth: 280, fontWeight: 600 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}
