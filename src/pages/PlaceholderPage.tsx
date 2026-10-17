import { Box, Container, Typography } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import { colors } from '../theme/theme';

/** Temporary page for a screen that is built in a later step. Removed screen by screen. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
      <Box sx={{ width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '20px', display: 'grid', placeItems: 'center', bgcolor: colors.softBlue, color: colors.gold }}>
        <ConstructionRoundedIcon fontSize="large" />
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>{title}</Typography>
      <Typography color="text.secondary">המסך הזה ייבנה בשלב הבא של הפרויקט.</Typography>
    </Container>
  );
}
