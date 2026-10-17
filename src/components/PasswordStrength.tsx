import { Box, LinearProgress, Typography } from '@mui/material';
import { measureStrength } from '../utils/passwordStrength';

export function PasswordStrength({ password }: { password: string }) {
  const strength = measureStrength(password);
  if (!strength) return null;

  return (
    <Box sx={{ mt: -1 }} aria-live="polite">
      <LinearProgress
        variant="determinate"
        value={strength.value}
        color={strength.color}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'soft.blue' }}
      />
      <Typography variant="caption" color={`${strength.color}.main`} sx={{ fontWeight: 700 }}>
        חוזק הסיסמה: {strength.label}
      </Typography>
    </Box>
  );
}
