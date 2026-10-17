import { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'slotProps' | 'variant'>;

/** Password input with a lock icon and a show/hide toggle. Shared by the login and register forms. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockRoundedIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((current) => !current)}
                edge="end"
                aria-label={visible ? 'הסתרת הסיסמה' : 'הצגת הסיסמה'}
              >
                {visible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
        // Passwords and e-mail addresses are typed left-to-right even on a right-to-left page.
        htmlInput: { dir: 'ltr', style: { textAlign: 'right' } },
      }}
    />
  );
}
