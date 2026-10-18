import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ToastProvider } from './components/common/ToastProvider';
import { AppRoutes } from './routes/AppRoutes';
import { AppThemeProvider } from './theme/RtlProvider';

export default function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppThemeProvider>
  );
}
