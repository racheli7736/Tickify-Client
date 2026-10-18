import { Box, Stack, Tooltip, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { keyframes } from '@mui/material/styles';
import { useMemo } from 'react';
import type { Seat } from '../../types/api';
import { colors } from '../../theme/theme';
import { groupByRow, seatLabel } from '../../utils/seats';

const SEAT_SIZE = { xs: 30, sm: 36 };

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
`;

interface SeatButtonProps {
  seat: Seat;
  selected: boolean;
  taken: boolean;
  disabled: boolean;
  onToggle: (seat: Seat) => void;
}

function SeatButton({ seat, selected, taken, disabled, onToggle }: SeatButtonProps) {
  const sold = seat.status === 'Sold';
  const state = sold ? 'תפוס' : selected ? 'נבחר' : 'פנוי';

  const base = {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    p: 0,
    flexShrink: 0,
    borderRadius: '10px 10px 6px 6px',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: { xs: '0.7rem', sm: '0.8rem' },
    display: 'grid',
    placeItems: 'center',
    transition: 'transform .12s ease, background-color .12s ease, box-shadow .12s ease',
  } as const;

  const look = sold
    ? {
        bgcolor: '#E6EAF0',
        color: '#9AA6B6',
        border: `2px solid ${taken ? '#C0392B' : '#E6EAF0'}`,
        cursor: 'not-allowed',
        animation: taken ? `${shake} .5s ease` : undefined,
      }
    : selected
      ? { bgcolor: colors.gold, color: colors.navy, border: `2px solid ${colors.goldDark}`, cursor: 'pointer', transform: 'translateY(-2px)', boxShadow: '0 6px 14px rgba(201,163,78,0.55)' }
      : {
          bgcolor: colors.white,
          color: colors.navy,
          border: `2px solid ${colors.navy}`,
          cursor: disabled ? 'default' : 'pointer',
          '&:hover': disabled ? undefined : { bgcolor: colors.softBlue, transform: 'translateY(-2px)' },
        };

  const button = (
    <Box
      component="button"
      type="button"
      disabled={sold || disabled}
      aria-pressed={selected}
      aria-label={`${seatLabel(seat)} - ${state}`}
      onClick={() => onToggle(seat)}
      sx={{ ...base, ...look, '&:focus-visible': { outline: `3px solid ${colors.gold}`, outlineOffset: 2 } }}
    >
      {sold ? <CloseRoundedIcon sx={{ fontSize: 16 }} /> : seat.number}
    </Box>
  );

  return (
    <Tooltip title={`${seatLabel(seat)} · ${state}`} arrow disableInteractive>
      <span>{button}</span>
    </Tooltip>
  );
}

interface SeatMapProps {
  seats: Seat[];
  selected: ReadonlySet<number>;
  /** Seats the user had chosen that someone else bought first (highlighted after a 409). */
  taken?: ReadonlySet<number>;
  disabled?: boolean;
  onToggle: (seat: Seat) => void;
}

/** The hall: a stage at the top and the rows of seats below it. Rows are laid out left-to-right like a real seating chart. */
export function SeatMap({ seats, selected, taken, disabled = false, onToggle }: SeatMapProps) {
  const rows = useMemo(() => groupByRow(seats), [seats]);

  return (
    <Box dir="ltr" sx={{ overflowX: 'auto', py: 1 }} role="group" aria-label="מפת מושבים">
      <Box sx={{ minWidth: 'max-content', mx: 'auto', px: 1, width: 'fit-content' }}>
        {/* stage */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              height: 14,
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              background: `linear-gradient(180deg, ${colors.gold}, ${colors.goldDark})`,
              boxShadow: '0 8px 24px rgba(201,163,78,0.4)',
            }}
          />
          <Typography sx={{ mt: 0.75, fontWeight: 800, letterSpacing: 6, color: colors.navy, fontSize: '0.85rem' }}>במה</Typography>
        </Box>

        <Stack spacing={1}>
          {rows.map((row) => (
            <Stack key={row.row} direction="row" spacing={0.75} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Typography dir="rtl" sx={{ width: 54, flexShrink: 0, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                שורה {row.row}
              </Typography>
              {row.seats.map((seat) => (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  selected={selected.has(seat.id)}
                  taken={taken?.has(seat.id) ?? false}
                  disabled={disabled}
                  onToggle={onToggle}
                />
              ))}
              <Typography dir="rtl" sx={{ width: 54, flexShrink: 0, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                שורה {row.row}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
