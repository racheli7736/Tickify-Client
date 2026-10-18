import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { eventsApi } from '../../api/events.api';
import { toApiError } from '../../api/errors';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHero } from '../../components/common/PageHero';
import { Paginator } from '../../components/common/Paginator';
import { SearchField } from '../../components/common/SearchField';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../hooks/useToast';
import type { EventSummary } from '../../types/api';
import { categoryLabel } from '../../utils/categories';
import { parseSort, splitSort, sortOptions } from '../../utils/eventSort';
import { formatDateTime, formatPrice, hasStarted } from '../../utils/format';

const PAGE_SIZE = 10;

/** Admin: every event (also finished ones) with edit and delete. */
export function AdminEventsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const sort = parseSort(params.get('sort'));
  const page = Math.max(1, Number(params.get('page')) || 1);
  const navigate = useNavigate();
  const toast = useToast();

  const update = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (!value) next.delete(key);
            else next.set(key, value);
          }
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const query = useMemo(() => ({ search: search || undefined, ...splitSort(sort), page, pageSize: PAGE_SIZE }), [search, sort, page]);
  const events = useApiQuery(`admin-events-${JSON.stringify(query)}`, (signal) => eventsApi.list(query, signal));
  const result = events.data;

  const [toDelete, setToDelete] = useState<EventSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await eventsApi.remove(toDelete.id);
      toast.show(`האירוע "${toDelete.name}" נמחק`);
      setToDelete(null);
      events.reload();
    } catch (caught) {
      const apiError = toApiError(caught);
      setDeleteError(
        apiError.status === 409 ? 'לא ניתן למחוק אירוע שנמכרו בו כרטיסים או שקיימות עבורו הזמנות (גם מבוטלות).' : apiError.message,
      );
      if (apiError.status === 404) events.reload();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHero title="ניהול אירועים" subtitle="יצירה, עריכה ומחיקה של אירועים. בעת יצירה נוצרים כל המושבים אוטומטית." />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { md: 'center' } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchField value={search} onSearch={(text) => update({ q: text.trim() })} label="חיפוש אירוע" placeholder="שם האירוע..." />
          </Box>
          <TextField select label="מיון" value={sort} onChange={(event) => update({ sort: event.target.value === 'date:asc' ? undefined : event.target.value })} sx={{ width: { xs: '100%', md: 250 }, flexShrink: 0 }}>
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Button component={RouterLink} to="/admin/events/new" variant="contained" color="secondary" size="large" startIcon={<AddRoundedIcon />} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            אירוע חדש
          </Button>
        </Stack>

        {!result && events.loading && <Skeleton variant="rounded" height={420} aria-busy />}
        {events.error && <ErrorState error={events.error} onRetry={events.reload} />}

        {!events.error && result && result.items.length === 0 && (
          <EmptyState
            icon={<EventNoteRoundedIcon fontSize="large" />}
            title={search ? 'לא נמצאו אירועים לחיפוש' : 'עדיין אין אירועים'}
            text={search ? undefined : 'צרי את האירוע הראשון.'}
            actionLabel={search ? 'ניקוי החיפוש' : 'אירוע חדש'}
            onAction={() => (search ? update({ q: undefined }) : navigate('/admin/events/new'))}
          />
        )}

        {!events.error && result && result.items.length > 0 && (
          <>
            <Typography variant="h6" component="h2" aria-live="polite" sx={{ fontWeight: 700, mb: 2 }}>
              {result.totalCount} אירועים
            </Typography>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden', opacity: events.loading ? 0.55 : 1 }}>
              <TableContainer>
                <Table sx={{ minWidth: 900 }} aria-label="רשימת אירועים">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'soft.blue', '& th': { fontWeight: 800 } }}>
                      <TableCell>אירוע</TableCell>
                      <TableCell>מועד</TableCell>
                      <TableCell>קטגוריות</TableCell>
                      <TableCell>מחיר</TableCell>
                      <TableCell>מושבים פנויים</TableCell>
                      <TableCell align="center">פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.items.map((event) => (
                      <TableRow key={event.id} hover data-testid="admin-event-row">
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography sx={{ fontWeight: 700 }} noWrap>{event.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{event.venue}</Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(event.startsAt)}
                          {hasStarted(event.startsAt) && <Chip label="התקיים" size="small" sx={{ ms: 1, marginInlineStart: 1 }} />}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                            {event.categories.map((category) => (
                              <Chip key={category} label={categoryLabel(category)} size="small" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{formatPrice(event.ticketPrice)}</TableCell>
                        <TableCell>{event.availableSeats}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="עריכה" describeChild>
                            <IconButton component={RouterLink} to={`/admin/events/${event.id}/edit`} aria-label={`עריכה: ${event.name}`}>
                              <EditRoundedIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="מחיקה" describeChild>
                            <IconButton color="error" aria-label={`מחיקה: ${event.name}`} onClick={() => { setDeleteError(null); setToDelete(event); }}>
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paginator page={page} totalPages={result.totalPages} onChange={(value) => { update({ page: value === 1 ? undefined : String(value) }, false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </Container>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="מחיקת אירוע"
        confirmLabel="מחיקה"
        danger
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        האם למחוק את האירוע <strong>{toDelete?.name}</strong> ואת כל המושבים שלו? אפשר למחוק רק אירוע שלא נמכרו בו כרטיסים.
      </ConfirmDialog>
    </>
  );
}
