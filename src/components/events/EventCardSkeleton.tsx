import { Box, Card, Skeleton } from '@mui/material';

/** Placeholder with the same shape as EventCard, shown while the first page loads. */
export function EventCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }} aria-hidden>
      <Skeleton variant="rectangular" height={150} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="85%" height={30} />
        <Skeleton width="60%" />
        <Skeleton width="40%" />
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width={90} height={40} />
          <Skeleton width={110} height={28} sx={{ borderRadius: 4 }} />
        </Box>
        <Skeleton variant="rounded" height={44} sx={{ mt: 1.5 }} />
      </Box>
    </Card>
  );
}
