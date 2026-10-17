import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { toApiError } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import { AuthCard } from '../components/AuthCard';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { muiRegister } from '../utils/forms';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// The limits mirror the API's RegisterRequest (FullName 2-100, Email up to 200, Password 6-100).
const schema: yup.ObjectSchema<RegisterForm> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required('יש להזין שם מלא')
    .min(2, 'השם חייב להכיל לפחות 2 תווים')
    .max(100, 'השם יכול להכיל עד 100 תווים'),
  email: yup
    .string()
    .trim()
    .required('יש להזין כתובת אימייל')
    .email('כתובת האימייל אינה תקינה')
    .max(200, 'כתובת האימייל יכולה להכיל עד 200 תווים'),
  password: yup
    .string()
    .required('יש להזין סיסמה')
    .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים')
    .max(100, 'הסיסמה יכולה להכיל עד 100 תווים'),
  confirmPassword: yup
    .string()
    .required('יש לאשר את הסיסמה')
    .oneOf([yup.ref('password')], 'הסיסמאות אינן תואמות'),
});

const knownFields = ['fullName', 'email', 'password'] as const;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setEmailTaken(false);
    try {
      await registerUser({ fullName: values.fullName.trim(), email: values.email.trim(), password: values.password });
      // The API logs the new user in (it returns a token), so go straight to the app.
      navigate('/events', { replace: true });
    } catch (caught) {
      const apiError = toApiError(caught);
      if (apiError.status === 409) {
        // The e-mail address is already registered.
        setEmailTaken(true);
        setFieldError('email', { type: 'server', message: 'כתובת האימייל כבר רשומה במערכת' });
        return;
      }
      if (apiError.status === 400) {
        // A rule the client did not catch: mark the fields the server complained about.
        for (const field of knownFields) {
          if (apiError.fieldErrors[field]) {
            setFieldError(field, { type: 'server', message: 'הערך שהוזן אינו תקין' });
          }
        }
      }
      setError(apiError.message);
    }
  });

  return (
    <AuthCard title="יצירת חשבון" subtitle="הצטרפי ל-Tickify, ובחרי מושבים לאירוע הבא שלך תוך דקות.">
      {emailTaken && (
        <Alert severity="warning" sx={{ mb: 2.5 }} role="alert">
          כבר קיים חשבון עם כתובת האימייל הזו.{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            להתחברות
          </Link>
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
            label="שם מלא"
            autoComplete="name"
            autoFocus
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            {...muiRegister(register('fullName'))}
          />

          <TextField
            label="אימייל"
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message ?? 'לפחות 6 תווים'}
            {...muiRegister(register('password'))}
          />
          <PasswordStrength password={password} />

          <PasswordField
            label="אימות סיסמה"
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            {...muiRegister(register('confirmPassword'))}
          />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ py: 1.5 }}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'יצירת חשבון'}
          </Button>
        </Stack>
      </Box>

      <Typography sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        כבר יש לך חשבון?{' '}
        <Link component={RouterLink} to="/login" underline="hover">
          התחברות
        </Link>
      </Typography>
    </AuthCard>
  );
}
