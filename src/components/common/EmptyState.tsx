import { Box, Button, Typography } from '@mui/material';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import type { ReactNode } from 'react';
import { colors } from '../../theme/theme';

interface EmptyStateProps {
  title: string;
  text?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown when a list is legitimately empty (no results, nothing yet). */
export function EmptyState({ title, text, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '24px', display: 'grid', placeItems: 'center', bgcolor: colors.softBlue, color: colors.gold }}>
        {icon ?? <SearchOffRoundedIcon fontSize="large" />}
      </Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {text && (
        <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
          {text}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
