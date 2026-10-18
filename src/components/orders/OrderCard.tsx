import { Box, Button, Card, Divider, Link, Stack, Typography } from '@mui/material';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { Link as RouterLink } from 'react-router-dom';
import type { Order } from '../../types/api';
import { colors } from '../../theme/theme';
import { formatDateTime, formatPrice, formatShortDate, hasStarted } from '../../utils/format';
import { formatSeatsSummary } from '../../utils/seats';
import { canCancel } from '../../utils/orders';
import { OrderStatusChip } from './OrderStatusChip';

interface OrderCardProps {
  order: Order;
  onCancel: (order: Order) => void;
}

export function OrderCard({ order, onCancel }: OrderCardProps) {
  const cancelled = order.status === 'Cancelled';
  const over = hasStarted(order.eventStartsAt);

  return (
    <Card sx={{ p: { xs: 2.5, md: 3 }, opacity: cancelled ? 0.75 : 1 }} data-testid="order-card" data-order-id={order.id}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            הזמנה מספר {order.id} · בוצעה ב-{formatShortDate(order.createdAt)}
          </Typography>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            <Link component={RouterLink} to={`/events/${order.eventId}`} underline="hover" sx={{ color: 'primary.main' }}>
              {order.eventName}
            </Link>
          </Typography>
        </Box>
        <OrderStatusChip status={order.status} />
      </Stack>

      <Stack spacing={1} sx={{ mt: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <CalendarMonthRoundedIcon fontSize="small" sx={{ color: colors.gold }} />
          <Typography variant="body2">{formatDateTime(order.eventStartsAt)}</Typography>
          {over && <Typography variant="caption" sx={{ color: 'text.secondary' }}>(האירוע התקיים)</Typography>}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', color: 'text.secondary' }}>
          <EventSeatRoundedIcon fontSize="small" sx={{ color: colors.gold, mt: 0.25 }} />
          <Typography variant="body2" data-testid="order-seats">{formatSeatsSummary(order.seatsSummary)}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">סה״כ</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1 }}>{formatPrice(order.totalPrice)}</Typography>
        </Box>
        {canCancel(order) ? (
          <Button variant="outlined" color="error" onClick={() => onCancel(order)}>
            ביטול הזמנה
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {cancelled ? 'ההזמנה בוטלה והמושבים שוחררו' : 'לא ניתן לבטל הזמנה לאירוע שהתקיים'}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
