import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import type { Seat } from '../../types/api';
import { colors } from '../../theme/theme';
import { formatPrice } from '../../utils/format';
import { MAX_SEATS_PER_ORDER, seatLabel } from '../../utils/seats';

interface BookingSummaryProps {
  selectedSeats: Seat[];
  ticketPrice: number;
  /** When set, booking is not possible and this explains why. */
  blockedReason?: string;
  onRemove: (seat: Seat) => void;
  onClear: () => void;
  onContinue: () => void;
}

/** The side panel: the chosen seats, the total price and the button that starts the purchase. */
export function BookingSummary({ selectedSeats, ticketPrice, blockedReason, onRemove, onClear, onContinue }: BookingSummaryProps) {
  const count = selectedSeats.length;
  const total = count * ticketPrice;

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 34px rgba(20,43,73,0.1)' }}
      aria-label="סיכום ההזמנה"
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: colors.softBlue, color: colors.gold }}>
          <ConfirmationNumberRoundedIcon />
        </Box>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
          ההזמנה שלך
        </Typography>
      </Stack>

      {blockedReason && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {blockedReason}
        </Alert>
      )}

      {count === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          בחרי מושבים על המפה (עד {MAX_SEATS_PER_ORDER} בהזמנה אחת).
        </Typography>
      ) : (
        <>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }} aria-label="המושבים שנבחרו">
            {selectedSeats.map((seat) => (
              <Chip
                key={seat.id}
                label={seatLabel(seat)}
                onDelete={() => onRemove(seat)}
                sx={{ bgcolor: 'rgba(201,163,78,0.18)', color: colors.navy, fontWeight: 700, '& .MuiChip-deleteIcon': { color: colors.goldDark } }}
              />
            ))}
          </Stack>
          <Button size="small" onClick={onClear} sx={{ mb: 1, px: 0.5 }}>
            ניקוי הבחירה
          </Button>
        </>
      )}

      {count >= MAX_SEATS_PER_ORDER && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          הגעת למקסימום של {MAX_SEATS_PER_ORDER} מושבים בהזמנה.
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.secondary">כרטיסים</Typography>
          <Typography sx={{ fontWeight: 700 }}>{count}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.secondary">מחיר לכרטיס</Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatPrice(ticketPrice)}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', pt: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>סה״כ לתשלום</Typography>
          <Typography data-testid="total-price" sx={{ fontWeight: 800, fontSize: '1.7rem', color: colors.navy }}>
            {formatPrice(total)}
          </Typography>
        </Stack>
      </Stack>

      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        disabled={count === 0 || Boolean(blockedReason)}
        onClick={onContinue}
        sx={{ mt: 3 }}
      >
        המשך להזמנה
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
        אפשר לבטל הזמנה עד מועד האירוע.
      </Typography>
    </Paper>
  );
}
