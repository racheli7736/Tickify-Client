import { useCallback, useMemo } from 'react';
import { Box, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi } from '../api/categories.api';
import { eventsApi } from '../api/events.api';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PageHero } from '../components/common/PageHero';
import { Paginator } from '../components/common/Paginator';
import { EventCard } from '../components/events/EventCard';
import { EventCardSkeleton } from '../components/events/EventCardSkeleton';
import { EventFilters } from '../components/events/EventFilters';
import { useApiQuery } from '../hooks/useApiQuery';
import { DEFAULT_SORT, parseSort, splitSort } from '../utils/eventSort';

const PAGE_SIZES = [3, 6, 9, 12];
const DEFAULT_PAGE_SIZE = 6;

const gridSx = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
} as const;

/** Positive integer from the URL, or the fallback. */
const toPositiveInt = (raw: string | null, fallback: number) => {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export function EventsPage() {
  // The filters live in the URL: the page can be shared, refreshed and navigated with the back button.
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const categoryId = params.get('category') ? toPositiveInt(params.get('category'), 0) || undefined : undefined;
  const sort = parseSort(params.get('sort'));
  const page = toPositiveInt(params.get('page'), 1);
  const pageSize = PAGE_SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : DEFAULT_PAGE_SIZE;

  const update = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '') next.delete(key);
            else next.set(key, value);
          }
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const categories = useApiQuery('categories', (signal) => categoriesApi.list(signal));

  const query = useMemo(
    () => ({ search: search || undefined, categoryId, ...splitSort(sort), page, pageSize }),
    [search, categoryId, sort, page, pageSize],
  );
  const events = useApiQuery(JSON.stringify(query), (signal) => eventsApi.list(query, signal));

  const result = events.data;
  const hasFilters = Boolean(search || categoryId || sort !== DEFAULT_SORT);
  const clearFilters = () => setParams({}, { replace: true });
  const handleSearch = useCallback((text: string) => update({ q: text.trim() }), [update]);

  const firstLoad = events.loading && !result;

  return (
    <>
      <PageHero title="האירועים הקרובים" subtitle="הופעות, תיאטרון, קומדיה וספורט - בחרי אירוע, בחרי מושבים, והכרטיסים שלך מוכנים." overlap />

      <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -8 }, position: 'relative' }}>
        <EventFilters
          search={search}
          categoryId={categoryId}
          sort={sort}
          categories={categories.data ?? []}
          onSearch={handleSearch}
          onCategory={(id) => update({ category: id === undefined ? undefined : String(id) })}
          onSort={(value) => update({ sort: value === DEFAULT_SORT ? undefined : value })}
        />

        {/* summary line + page size */}
        <Stack
          direction="row"
          sx={{ mt: 4, mb: 2.5, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}
        >
          <Typography variant="h6" component="h2" aria-live="polite" sx={{ fontWeight: 700 }}>
            {result ? (result.totalCount === 0 ? 'לא נמצאו אירועים' : `נמצאו ${result.totalCount} אירועים`) : 'טוענת אירועים...'}
          </Typography>
          <TextField
            select
            size="small"
            label="אירועים בעמוד"
            value={pageSize}
            onChange={(event) => update({ size: event.target.value === String(DEFAULT_PAGE_SIZE) ? undefined : event.target.value })}
            sx={{ width: 160 }}
          >
            {PAGE_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* content */}
        {firstLoad && (
          <Box sx={gridSx} aria-busy>
            {Array.from({ length: pageSize }, (_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </Box>
        )}

        {events.error && <ErrorState error={events.error} onRetry={events.reload} />}

        {!events.error && result && result.items.length === 0 && (
          <EmptyState
            icon={<EventBusyRoundedIcon fontSize="large" />}
            title={hasFilters ? 'לא נמצאו אירועים שמתאימים לחיפוש' : 'אין אירועים להצגה כרגע'}
            text={hasFilters ? 'נסי לשנות את החיפוש או לנקות את המסננים.' : 'אירועים חדשים יופיעו כאן ברגע שייווצרו.'}
            actionLabel={hasFilters ? 'ניקוי מסננים' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {!events.error && result && result.items.length > 0 && (
          <Box sx={{ ...gridSx, opacity: events.loading ? 0.55 : 1, transition: 'opacity .15s', pointerEvents: events.loading ? 'none' : 'auto' }} aria-busy={events.loading}>
            {result.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Box>
        )}

        {/* real server-side pagination: every page change is a new request */}
        {!events.error && result && (
          <Paginator
            page={page}
            totalPages={result.totalPages}
            onChange={(value) => {
              update({ page: value === 1 ? undefined : String(value) }, false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Container>
    </>
  );
}
