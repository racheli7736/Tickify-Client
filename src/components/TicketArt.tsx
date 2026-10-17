import { Box, Stack, Typography } from '@mui/material';
import { colors } from '../theme/theme';

/** A decorative "ticket" (pure CSS, no images) for the brand panel. Purely visual - hidden from screen readers. */
export function TicketArt() {
  return (
    <Box
      aria-hidden
      sx={{
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        borderRadius: '18px',
        overflow: 'hidden',
        transform: 'rotate(-3deg)',
        boxShadow: '0 22px 50px rgba(0,0,0,0.35)',
        background: `linear-gradient(135deg, ${colors.goldLight}, ${colors.gold})`,
        color: colors.navy,
      }}
    >
      <Stack sx={{ flex: 1, p: 2.5 }} spacing={0.5}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, opacity: 0.75 }}>כרטיס כניסה</Typography>
        <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.2 }}>ערב רוק בקיץ</Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>אצטדיון העיר · שורה 3 · מושב 5</Typography>
      </Stack>
      {/* perforation */}
      <Box sx={{ width: 0, borderLeft: `2px dashed ${colors.navy}`, opacity: 0.35, my: 1.5 }} />
      <Box sx={{ width: 84, display: 'grid', placeItems: 'center', bgcolor: 'rgba(20,43,73,0.08)' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 3 }}>
          VIP
        </Typography>
      </Box>
    </Box>
  );
}
