import { Pagination, Stack, Typography } from '@mui/material';

interface PaginatorProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** Page buttons for any server-paged list. Renders nothing when there is only one page. */
export function Paginator({ page, totalPages, onChange }: PaginatorProps) {
  if (totalPages <= 1) return null;

  return (
    <Stack sx={{ mt: 4, alignItems: 'center' }}>
      <Pagination
        count={totalPages}
        page={Math.min(page, totalPages)}
        onChange={(_, value) => onChange(value)}
        color="primary"
        size="large"
        shape="rounded"
        showFirstButton
        showLastButton
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
        עמוד {Math.min(page, totalPages)} מתוך {totalPages}
      </Typography>
    </Stack>
  );
}
