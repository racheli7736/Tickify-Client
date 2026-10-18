import { Box, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { colors } from '../../theme/theme';

const swatch = { width: 22, height: 22, borderRadius: '7px 7px 4px 4px', display: 'grid', placeItems: 'center' } as const;

/** Explains the colors of the seat map. */
export function SeatLegend() {
  return (
    <Stack direction="row" spacing={3} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }} aria-hidden>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ ...swatch, border: `2px solid ${colors.navy}`, bgcolor: colors.white }} />
        <Typography variant="body2">פנוי</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ ...swatch, border: `2px solid ${colors.goldDark}`, bgcolor: colors.gold }} />
        <Typography variant="body2">נבחר</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ ...swatch, bgcolor: '#E6EAF0', color: '#9AA6B6' }}>
          <CloseRoundedIcon sx={{ fontSize: 14 }} />
        </Box>
        <Typography variant="body2">תפוס</Typography>
      </Stack>
    </Stack>
  );
}
