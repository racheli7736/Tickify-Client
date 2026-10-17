import { Box, Container, Stack, Typography } from '@mui/material';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { TicketArt } from '../components/TicketArt';
import { colors } from '../theme/theme';

const features: { icon: ReactNode; text: string }[] = [
  { icon: <EventSeatRoundedIcon />, text: 'בוחרים מושבים ישירות על מפת האולם' },
  { icon: <VerifiedUserRoundedIcon />, text: 'מושב אחד, קונה אחד - בלי כפל הזמנות' },
  { icon: <BoltRoundedIcon />, text: 'אישור הזמנה מיידי, וביטול בקליק' },
];

/** Split screen for login/register: a navy brand panel next to a white form area. Stacks on small screens. */
export function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: 'background.default' }}>
      {/* brand panel */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flex: { md: '0 0 46%' },
          color: colors.white,
          px: { xs: 3, md: 8 },
          py: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `radial-gradient(circle at 15% 10%, ${colors.navyLight} 0%, transparent 45%), linear-gradient(160deg, ${colors.navy} 0%, ${colors.navyDark} 100%)`,
        }}
      >
        {/* decorative gold rings */}
        <Box sx={{ position: 'absolute', top: -120, left: -120, width: 340, height: 340, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.25 }} />
        <Box sx={{ position: 'absolute', bottom: -160, right: -100, width: 420, height: 420, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.18 }} />
        <Box sx={{ position: 'absolute', bottom: 60, left: -40, width: 150, height: 150, borderRadius: '50%', bgcolor: colors.gold, opacity: 0.08 }} />

        <Box sx={{ position: 'relative' }}>
          <Logo tone="light" to="/" size="large" />
        </Box>

        <Box sx={{ position: 'relative', my: { xs: 4, md: 0 } }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 2, fontSize: { xs: '1.9rem', md: '2.7rem' } }}>
            החוויה הבאה שלך
            <br />
            <Box component="span" sx={{ color: colors.gold }}>מתחילה כאן</Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.1rem', maxWidth: 440, mb: 4 }}>
            הופעות, תיאטרון, קומדיה וספורט - כל האירועים במקום אחד, עם בחירת מושבים מדויקת ורכישה בכמה לחיצות.
          </Typography>

          <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {features.map((feature) => (
              <Stack key={feature.text} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(201,163,78,0.16)', color: colors.gold }}>
                  {feature.icon}
                </Box>
                <Typography sx={{ fontWeight: 500 }}>{feature.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
          <TicketArt />
        </Box>
      </Box>

      {/* form area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 5, md: 6 }, bgcolor: 'background.default' }}>
        <Container maxWidth="sm">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
