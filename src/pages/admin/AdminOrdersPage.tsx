import { useCallback, useMemo } from 'react';
import { Box, Container, Link, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHero } from '../../components/common/PageHero';
import { Paginator } from '../../components/common/Paginator';
import { OrderStatusChip } from '../../components/orders/OrderStatusChip';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatDateTime, formatPrice, formatShortDate } from '../../utils/format';
import { formatSeatsSummary } from '../../utils/seats';

const PAGE_SIZE = 10;

/** Admin: every order in the system. The API returns the purchaser's id and name (never the e-mail). */
export function AdminOrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);

  const query = useMemo(() => ({ page, pageSize: PAGE_SIZE }), [page]);
  const orders = useApiQuery(`admin-orders-${JSON.stringify(query)}`, (signal) => ordersApi.list(query, signal));
  const result = orders.data;

  const changePage = useCallback(
    (next: number) => {
      setParams(next === 1 ? {} : { page: String(next) }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setParams],
  );

  return (
    <>
      <PageHero title="כל ההזמנות" subtitle="סקירת כל ההזמנות במערכת: מי הזמין, לאיזה אירוע, אילו מושבים ובאיזה סכום." />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {!result && orders.loading && <Skeleton variant="rounded" height={420} aria-busy />}
        {orders.error && <ErrorState error={orders.error} onRetry={orders.reload} />}

        {!orders.error && result && result.items.length === 0 && (
          <EmptyState icon={<ReceiptLongRoundedIcon fontSize="large" />} title="אין הזמנות במערכת" text="הזמנות יופיעו כאן ברגע שמשתמשים יזמינו כרטיסים." />
        )}

        {!orders.error && result && result.items.length > 0 && (
          <>
            <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2" aria-live="polite" sx={{ fontWeight: 700 }}>
                {result.totalCount} הזמנות
              </Typography>
            </Stack>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden', opacity: orders.loading ? 0.55 : 1 }}>
              <TableContainer>
                <Table sx={{ minWidth: 900 }} aria-label="כל ההזמנות">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'soft.blue', '& th': { fontWeight: 800 } }}>
                      <TableCell>#</TableCell>
                      <TableCell>קונה</TableCell>
                      <TableCell>אירוע</TableCell>
                      <TableCell>מושבים</TableCell>
                      <TableCell>סכום</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>בוצעה</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.items.map((order) => (
                      <TableRow key={order.id} hover data-testid="admin-order-row">
                        <TableCell sx={{ fontWeight: 700 }}>{order.id}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{order.userFullName ?? 'משתמש לא ידוע'}</Typography>
                          <Typography variant="caption" color="text.secondary">מזהה משתמש {order.userId}</Typography>
                        </TableCell>
                        <TableCell>
                          <Link component={RouterLink} to={`/events/${order.eventId}`} underline="hover" sx={{ color: 'primary.main' }}>
                            {order.eventName}
                          </Link>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{formatDateTime(order.eventStartsAt)}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography variant="body2">{formatSeatsSummary(order.seatsSummary)}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{formatPrice(order.totalPrice)}</TableCell>
                        <TableCell><OrderStatusChip status={order.status} /></TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatShortDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Box>
              <Paginator page={page} totalPages={result.totalPages} onChange={changePage} />
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
