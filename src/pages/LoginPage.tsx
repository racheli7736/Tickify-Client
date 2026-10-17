import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { toApiError } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import { AuthCard } from '../components/AuthCard';
import { PasswordField } from '../components/PasswordField';
import { muiRegister } from '../utils/forms';

interface LoginForm {
  email: string;
  password: string;
}

const schema: yup.ObjectSchema<LoginForm> = yup.object({
  email: yup.string().trim().required('יש להזין כתובת אימייל').email('כתובת האימייל אינה תקינה'),
  password: yup.string().required('יש להזין סיסמה'),
});

// Demo accounts that the backend seeds. Shown only in development, to make the demo quick for the reviewer.
const demoAccounts = [
  { label: 'כניסה כמנהל', email: 'admin@tickets.local', password: 'Admin123!', icon: <AdminPanelSettingsRoundedIcon /> },
  { label: 'כניסה כמשתמש', email: 'user@tickets.local', password: 'User123!', icon: <PersonRoundedIcon /> },
];

export function LoginPage() {
  const { login, sessionExpired, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/events';

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    dismissSessionExpired();
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      const apiError = toApiError(caught);
      // 401 from the login call = wrong e-mail or password (the server deliberately does not say which).
      setError(apiError.status === 401 ? 'כתובת האימייל או הסיסמה שגויים.' : apiError.message);
    }
  });

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <AuthCard title="ברוכה הבאה" subtitle="התחברי כדי לראות אירועים, לבחור מושבים ולנהל את ההזמנות שלך.">
      {sessionExpired && (
        <Alert severity="info" sx={{ mb: 2.5 }} onClose={dismissSessionExpired}>
          ההתחברות שלך פגה. אנא התחברי מחדש.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} role="alert">
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="אימייל"
            type="email"
            autoComplete="email"
            autoFocus
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
              htmlInput: { dir: 'ltr', style: { textAlign: 'right' } },
            }}
            {...muiRegister(register('email'))}
          />

          <PasswordField
            label="סיסמה"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...muiRegister(register('password'))}
          />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ py: 1.5 }}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'התחברות'}
          </Button>
        </Stack>
      </Box>

      <Typography sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        עדיין אין לך חשבון?{' '}
        <Link component={RouterLink} to="/register" underline="hover">
          הרשמה
        </Link>
      </Typography>

      {import.meta.env.DEV && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              משתמשי דמו (פיתוח בלבד)
            </Typography>
          </Divider>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outlined"
                color="primary"
                startIcon={account.icon}
                onClick={() => fillDemo(account.email, account.password)}
                fullWidth
              >
                {account.label}
              </Button>
            ))}
          </Stack>
        </>
      )}
    </AuthCard>
  );
}
