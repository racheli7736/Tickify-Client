import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../theme/theme';

interface StatusPageProps {
  code: '404' | '403';
}

const content = {
  '404': { title: 'העמוד לא נמצא', text: 'הכתובת שחיפשת אינה קיימת, או שהעמוד הוסר.' },
  '403': { title: 'אין לך הרשאה', text: 'העמוד הזה שמור למנהלי המערכת בלבד.' },
};

/** Used for "not found" and "forbidden" screens. */
export function StatusPage({ code }: StatusPageProps) {
  const { title, text } = content[code];
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '7rem', fontWeight: 800, lineHeight: 1, color: colors.gold }}>{code}</Typography>
      <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>{text}</Typography>
      <Box>
        <Button component={RouterLink} to="/events" variant="contained" size="large">
          חזרה לאירועים
        </Button>
      </Box>
    </Container>
  );
}
