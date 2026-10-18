import { useCallback, useMemo, useState } from 'react';
import { Box, Container, Skeleton, Stack, Typography } from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../api/orders.api';
import { toApiError } from '../api/errors';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PageHero } from '../components/common/PageHero';
import { Paginator } from '../components/common/Paginator';
import { OrderCard } from '../components/orders/OrderCard';
import { useApiQuery } from '../hooks/useApiQuery';
import { useToast } from '../hooks/useToast';
import type { Order } from '../types/api';
import { formatSeatsSummary } from '../utils/seats';

const PAGE_SIZE = 5;

export function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const navigate = useNavigate();
  const toast = useToast();

  const query = useMemo(() => ({ page, pageSize: PAGE_SIZE }), [page]);
  const orders = useApiQuery(JSON.stringify(query), (signal) => ordersApi.list(query, signal));

  const [toCancel, setToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const changePage = useCallback(
    (next: number) => {
      setParams(next === 1 ? {} : { page: String(next) }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setParams],
  );

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await ordersApi.cancel(toCancel.id);
      toast.show(`הזמנה ${toCancel.id} בוטלה והמושבים שוחררו`);
      setToCancel(null);
      orders.reload();
    } catch (caught) {
      const apiError = toApiError(caught);
      // 400 = already cancelled or the event has started: the list may be stale, so refresh it too.
      setCancelError(apiError.status === 400 ? 'לא ניתן לבטל הזמנה זו: היא כבר בוטלה, או שהאירוע כבר התקיים.' : apiError.message);
      if (apiError.status === 400 || apiError.status === 404) orders.reload();
    } finally {
      setCancelling(false);
    }
  };

  const result = orders.data;

  return (
    <>
      <PageHero title="ההזמנות שלי" subtitle="כל הכרטיסים שהזמנת, במקום אחד. אפשר לבטל הזמנה פעילה עד מועד האירוע." />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        {!result && orders.loading && (
          <Stack spacing={2.5} aria-busy>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={190} />
            ))}
          </Stack>
        )}

        {orders.error && <ErrorState error={orders.error} onRetry={orders.reload} />}

        {!orders.error && result && result.items.length === 0 && (
          <EmptyState
            icon={<ReceiptLongRoundedIcon fontSize="large" />}
            title="עדיין אין לך הזמנות"
            text="ברגע שתזמיני כרטיסים לאירוע, ההזמנה תופיע כאן."
            actionLabel="לצפייה באירועים"
            onAction={() => navigate('/events')}
          />
        )}

        {!orders.error && result && result.items.length > 0 && (
          <>
            <Typography variant="h6" component="h2" aria-live="polite" sx={{ fontWeight: 700, mb: 2.5 }}>
              {result.totalCount === 1 ? 'הזמנה אחת' : `${result.totalCount} הזמנות`}
            </Typography>
            <Box sx={{ display: 'grid', gap: 2.5, opacity: orders.loading ? 0.55 : 1, transition: 'opacity .15s' }} aria-busy={orders.loading}>
              {result.items.map((order) => (
                <OrderCard key={order.id} order={order} onCancel={(selected) => { setCancelError(null); setToCancel(selected); }} />
              ))}
            </Box>
            <Paginator page={page} totalPages={result.totalPages} onChange={changePage} />
          </>
        )}
      </Container>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="ביטול הזמנה"
        confirmLabel="כן, לבטל את ההזמנה"
        danger
        busy={cancelling}
        error={cancelError}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      >
        {toCancel && (
          <>
            <Typography sx={{ fontWeight: 700 }}>{toCancel.eventName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{formatSeatsSummary(toCancel.seatsSummary)}</Typography>
            <Typography>הזמנה מבוטלת משחררת את המושבים, והם יהיו זמינים לאחרים. האם לבטל?</Typography>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
