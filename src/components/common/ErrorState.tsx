import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { ApiError } from '../../api/errors';

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

/** Shown in place of a list/page whose data could not be loaded. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Box role="alert" sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '24px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(192,57,43,0.08)', color: 'error.main' }}>
        <ErrorOutlineRoundedIcon fontSize="large" />
      </Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        משהו השתבש
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
        {error.message}
      </Typography>
      {error.correlationId && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          מזהה פנייה לתמיכה: {error.correlationId}
        </Typography>
      )}
      {onRetry && (
        <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
          ניסיון חוזר
        </Button>
      )}
    </Box>
  );
}
