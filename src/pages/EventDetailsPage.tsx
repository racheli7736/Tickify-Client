import { useMemo, useState } from 'react';
import { Alert, AlertTitle, Box, Button, Card, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../api/events.api';
import { ordersApi } from '../api/orders.api';
import { toApiError } from '../api/errors';
import { useAuth } from '../auth/useAuth';
import { BookingSummary } from '../components/booking/BookingSummary';
import { OrderConfirmDialog, OrderSuccessDialog } from '../components/booking/OrderDialogs';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SeatLegend } from '../components/seats/SeatLegend';
import { SeatMap } from '../components/seats/SeatMap';
import { useApiQuery } from '../hooks/useApiQuery';
import { colors } from '../theme/theme';
import type { Order, Seat } from '../types/api';
import { availabilityOf } from '../utils/availability';
import { categoryLabel } from '../utils/categories';
import { formatDate, formatPrice, formatTime, hasStarted } from '../utils/format';
import { MAX_SEATS_PER_ORDER, seatLabel } from '../utils/seats';
import { Skeleton } from '@mui/material';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';

interface Conflict {
  /** The message the server wrote for this case (Hebrew). */
  message: string;
  /** What the user had chosen when the server refused. */
  seatIds: number[];
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: colors.gold, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontWeight: 500 }}>{children}</Typography>
    </Stack>
  );
}

export function EventDetailsPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const event = useApiQuery(`event-${eventId}`, (signal) => eventsApi.get(eventId, signal));
  const seatsQuery = useApiQuery(`seats-${eventId}`, (signal) => eventsApi.seats(eventId, signal));

  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const seats = useMemo(() => seatsQuery.data ?? [], [seatsQuery.data]);

  // Only seats that are still free can stay selected (after a refresh somebody else may have bought one).
  const selectedSeats = useMemo(
    () => seats.filter((seat) => selected.has(seat.id) && seat.status === 'Available'),
    [seats, selected],
  );
  const selectedIds = useMemo(() => new Set(selectedSeats.map((seat) => seat.id)), [selectedSeats]);

  // The seats the user wanted which are now sold: highlighted on the map and listed in the conflict message.
  const takenSeats = useMemo(
    () => (conflict ? seats.filter((seat) => conflict.seatIds.includes(seat.id) && seat.status === 'Sold') : []),
    [conflict, seats],
  );
  const takenIds = useMemo(() => new Set(takenSeats.map((seat) => seat.id)), [takenSeats]);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return <EmptyState title="האירוע לא נמצא" text="הכתובת שהוזנה אינה תקינה." />;
  }

  if (event.error?.status === 404) {
    return (
      <Container maxWidth="sm">
        <EmptyState
          icon={<EventBusyRoundedIcon fontSize="large" />}
          title="האירוע לא נמצא"
          text="ייתכן שהאירוע הוסר או שהקישור שגוי."
          actionLabel="חזרה לכל האירועים"
          onAction={() => navigate('/events')}
        />
      </Container>
    );
  }
  if (event.error) {
    return (
      <Container maxWidth="md">
        <ErrorState error={event.error} onRetry={event.reload} />
      </Container>
    );
  }
  if (!event.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }} aria-busy>
        <Skeleton variant="rounded" height={220} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={420} />
      </Container>
    );
  }

  const details = event.data;
  const availability = availabilityOf(details.availableSeats);
  const started = hasStarted(details.startsAt);

  // Why booking is impossible right now (shown in the summary panel, and the map is locked).
  const blockedReason = isAdmin
    ? 'חשבון מנהל אינו יכול לרכוש כרטיסים. אפשר לצפות במפת המושבים בלבד.'
    : started
      ? 'האירוע כבר התקיים, ולא ניתן להזמין כרטיסים.'
      : details.availableSeats === 0
        ? 'הכרטיסים לאירוע זה אזלו.'
        : undefined;

  const refreshAvailability = () => {
    seatsQuery.reload();
    event.reload();
  };

  const toggleSeat = (seat: Seat) => {
    setConflict(null);
    setPurchaseError(null);
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else if (selectedSeats.length < MAX_SEATS_PER_ORDER) {
        next.add(seat.id);
      }
      return next;
    });
  };

  const removeSeat = (seat: Seat) =>
    setSelected((previous) => {
      const next = new Set(previous);
      next.delete(seat.id);
      return next;
    });

  const purchase = async () => {
    setSubmitting(true);
    setPurchaseError(null);
    try {
      const created = await ordersApi.create({ eventId, seatIds: selectedSeats.map((seat) => seat.id) });
      setConfirmOpen(false);
      setSelected(new Set());
      setConflict(null);
      setOrder(created);
      refreshAvailability();
    } catch (caught) {
      const apiError = toApiError(caught);
      setConfirmOpen(false);
      if (apiError.status === 409) {
        // Another user bought one of the seats first. The whole order was rejected (all or nothing):
        // say so clearly, and reload the map so the user sees what is still free.
        setConflict({ message: apiError.message, seatIds: selectedSeats.map((seat) => seat.id) });
        refreshAvailability();
      } else {
        setPurchaseError(apiError.message);
        if (apiError.status === 404) refreshAvailability();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* header */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: colors.white,
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 6 },
          background: `radial-gradient(circle at 85% 0%, ${colors.navyLight} 0%, transparent 50%), linear-gradient(160deg, ${colors.navy} 0%, ${colors.navyDark} 100%)`,
        }}
      >
        <Box sx={{ position: 'absolute', top: -140, left: -100, width: 360, height: 360, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.22 }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Button component={RouterLink} to="/events" startIcon={<ArrowForwardRoundedIcon />} sx={{ color: 'rgba(255,255,255,0.85)', mb: 2, px: 0 }}>
            חזרה לכל האירועים
          </Button>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            {details.categories.map((category) => (
              <Chip key={category} label={categoryLabel(category)} size="small" sx={{ bgcolor: colors.gold, color: colors.navy, fontWeight: 700 }} />
            ))}
            {started && <Chip label="האירוע התקיים" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: colors.charcoal }} />}
          </Stack>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.8rem' }, mb: 2 }}>
            {details.name}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <MetaItem icon={<CalendarMonthRoundedIcon />}>{formatDate(details.startsAt)}</MetaItem>
            <MetaItem icon={<AccessTimeRoundedIcon />}>שעה {formatTime(details.startsAt)}</MetaItem>
            <MetaItem icon={<PlaceRoundedIcon />}>{details.venue}</MetaItem>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, pb: { xs: 14, md: 5 } }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, alignItems: 'start' }}>
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            {/* about */}
            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 1.5 }}>
                על האירוע
              </Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                {details.description || 'אין תיאור לאירוע זה.'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' } }}>
                {[
                  { label: 'מחיר לכרטיס', value: formatPrice(details.ticketPrice) },
                  { label: 'מושבים פנויים', value: String(details.availableSeats) },
                  { label: 'שורות באולם', value: String(details.rows) },
                  { label: 'מושבים בשורה', value: String(details.seatsPerRow) },
                ].map((fact) => (
                  <Box key={fact.label} sx={{ p: 1.75, borderRadius: '14px', bgcolor: colors.softBlue }}>
                    <Typography variant="caption" color="text.secondary">{fact.label}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{fact.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* seat map */}
            <Card sx={{ p: { xs: 2, md: 3.5 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                    בחירת מושבים
                  </Typography>
                  <Chip label={availability.label} color={availability.color} size="small" variant="outlined" sx={{ mt: 0.75 }} />
                </Box>
                <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={refreshAvailability} disabled={seatsQuery.loading}>
                  רענון המפה
                </Button>
              </Stack>

              {conflict && (
                <Alert
                  severity="warning"
                  role="alert"
                  data-testid="seat-conflict"
                  sx={{ mb: 2.5, border: '1px solid', borderColor: 'warning.main', alignItems: 'flex-start' }}
                  onClose={() => setConflict(null)}
                >
                  <AlertTitle sx={{ fontWeight: 800 }}>ההזמנה לא בוצעה - מושב נתפס</AlertTitle>
                  {conflict.message}
                  {takenSeats.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                      המושבים שנתפסו: {takenSeats.map(seatLabel).join(', ')}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    המפה עודכנה. בחרי מושבים פנויים והזמיני שוב.
                  </Typography>
                </Alert>
              )}
              {purchaseError && (
                <Alert severity="error" role="alert" sx={{ mb: 2.5 }} onClose={() => setPurchaseError(null)}>
                  {purchaseError}
                </Alert>
              )}

              {seatsQuery.error && !seatsQuery.data ? (
                <ErrorState error={seatsQuery.error} onRetry={seatsQuery.reload} />
              ) : !seatsQuery.data ? (
                <Skeleton variant="rounded" height={320} aria-busy />
              ) : (
                <Box sx={{ opacity: seatsQuery.loading ? 0.6 : 1, transition: 'opacity .15s' }} aria-busy={seatsQuery.loading}>
                  <SeatMap seats={seats} selected={selectedIds} taken={takenIds} disabled={Boolean(blockedReason) || submitting} onToggle={toggleSeat} />
                  <Box sx={{ mt: 3 }}>
                    <SeatLegend />
                  </Box>
                </Box>
              )}
            </Card>
          </Stack>

          {/* summary: a sticky side panel on large screens */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 92 }}>
            <BookingSummary
              selectedSeats={selectedSeats}
              ticketPrice={details.ticketPrice}
              blockedReason={blockedReason}
              onRemove={removeSeat}
              onClear={() => setSelected(new Set())}
              onContinue={() => setConfirmOpen(true)}
            />
          </Box>
        </Box>
      </Container>

      {/* small screens: the summary is a bar fixed to the bottom */}
      <Paper
        elevation={8}
        sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', insetInline: 0, bottom: 0, zIndex: 1100, borderRadius: '20px 20px 0 0', p: 2, borderTop: `3px solid ${colors.gold}` }}
      >
        {blockedReason ? (
          <Typography variant="body2" color="text.secondary">{blockedReason}</Typography>
        ) : (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {selectedSeats.length === 0 ? `בחרי מושבים (עד ${MAX_SEATS_PER_ORDER})` : `${selectedSeats.length} מושבים נבחרו`}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1 }}>
                {formatPrice(selectedSeats.length * details.ticketPrice)}
              </Typography>
            </Box>
            <Button variant="contained" color="secondary" size="large" disabled={selectedSeats.length === 0} onClick={() => setConfirmOpen(true)}>
              המשך להזמנה
            </Button>
          </Stack>
        )}
      </Paper>

      <OrderConfirmDialog
        open={confirmOpen}
        event={details}
        seats={selectedSeats}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={purchase}
      />
      <OrderSuccessDialog order={order} onClose={() => setOrder(null)} />
    </>
  );
}
