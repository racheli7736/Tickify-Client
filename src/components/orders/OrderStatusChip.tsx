import { Chip } from '@mui/material';
import type { OrderStatus } from '../../types/api';

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return status === 'Active' ? (
    <Chip label="פעילה" color="success" size="small" variant="outlined" />
  ) : (
    <Chip label="בוטלה" size="small" sx={{ bgcolor: '#EEF1F5', color: 'text.secondary' }} />
  );
}
