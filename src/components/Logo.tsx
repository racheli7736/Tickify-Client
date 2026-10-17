import { Box, Typography } from '@mui/material';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../theme/theme';

interface LogoProps {
  /** "light" = for dark (navy) backgrounds. */
  tone?: 'dark' | 'light';
  to?: string;
  size?: 'small' | 'large';
}

export function Logo({ tone = 'dark', to = '/', size = 'small' }: LogoProps) {
  const large = size === 'large';
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, textDecoration: 'none' }}
      aria-label="Tickify - לעמוד הראשי"
    >
      <Box
        sx={{
          width: large ? 48 : 38,
          height: large ? 48 : 38,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(135deg, ${colors.goldLight}, ${colors.gold})`,
          color: colors.navy,
          transform: 'rotate(-8deg)',
          boxShadow: '0 4px 12px rgba(201, 163, 78, 0.45)',
        }}
      >
        <ConfirmationNumberRoundedIcon fontSize={large ? 'large' : 'medium'} />
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: large ? '2rem' : '1.55rem',
          letterSpacing: '-0.5px',
          color: tone === 'light' ? colors.white : colors.navy,
          lineHeight: 1,
        }}
      >
        Tick<Box component="span" sx={{ color: colors.gold }}>ify</Box>
      </Typography>
    </Box>
  );
}
