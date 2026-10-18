import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Link as RouterLink } from 'react-router-dom';
import type { EventDetails, Order, Seat } from '../../types/api';
import { colors } from '../../theme/theme';
import { formatDateTime, formatPrice } from '../../utils/format';
import { formatSeatsSummary, seatLabel } from '../../utils/seats';

interface ConfirmDialogProps {
  open: boolean;
  event: EventDetails;
  seats: Seat[];
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Last step before the purchase: shows exactly what will be bought. */
export function OrderConfirmDialog({ open, event, seats, submitting, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onCancel} fullWidth maxWidth="xs" aria-labelledby="confirm-title">
      <DialogTitle id="confirm-title" sx={{ fontWeight: 800 }}>
        אישור הזמנה
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontWeight: 700 }}>{event.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {formatDateTime(event.startsAt)} · {event.venue}
        </Typography>
        <Divider />
        <List dense>
          {seats.map((seat) => (
            <ListItem key={seat.id} disableGutters secondaryAction={<Typography sx={{ fontWeight: 700 }}>{formatPrice(event.ticketPrice)}</Typography>}>
              <ListItemText primary={seatLabel(seat)} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mt: 1.5 }}>
          <Typography sx={{ fontWeight: 800 }}>סה״כ לתשלום</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem' }}>{formatPrice(seats.length * event.ticketPrice)}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button onClick={onCancel} disabled={submitting} color="primary">
          חזרה למפה
        </Button>
        <Button onClick={onConfirm} disabled={submitting} variant="contained" color="secondary" sx={{ minWidth: 170 }}>
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'אישור וביצוע הזמנה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SuccessDialogProps {
  order: Order | null;
  onClose: () => void;
}

/** Shown after the server answered 201: the order is saved. */
export function OrderSuccessDialog({ order, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={Boolean(order)} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="success-title">
      {order && (
        <>
          <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
            <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: colors.gold, color: colors.navy, boxShadow: '0 10px 26px rgba(201,163,78,0.5)' }}>
              <CheckRoundedIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography id="success-title" variant="h5" component="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
              ההזמנה אושרה!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              הכרטיסים שלך שמורים. מספר הזמנה: <strong>{order.id}</strong>
            </Typography>
            <Box sx={{ textAlign: 'start', p: 2, borderRadius: '14px', bgcolor: colors.softBlue }}>
              <Typography sx={{ fontWeight: 700 }}>{order.eventName}</Typography>
              <Typography variant="body2" color="text.secondary">{formatDateTime(order.eventStartsAt)}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{formatSeatsSummary(order.seatsSummary)}</Typography>
              <Divider sx={{ my: 1.25 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>סה״כ שולם</Typography>
                <Typography sx={{ fontWeight: 800 }}>{formatPrice(order.totalPrice)}</Typography>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0, flexDirection: 'column', gap: 1, '& > :not(style) ~ :not(style)': { ms: 0 } }}>
            <Button component={RouterLink} to="/orders" variant="contained" color="secondary" size="large" fullWidth>
              להזמנות שלי
            </Button>
            <Button onClick={onClose} fullWidth>
              המשך בצפייה באירוע
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
