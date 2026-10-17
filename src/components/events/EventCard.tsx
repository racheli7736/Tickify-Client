import { Box, Button, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import { Link as RouterLink } from 'react-router-dom';
import type { EventSummary } from '../../types/api';
import { colors } from '../../theme/theme';
import { availabilityOf } from '../../utils/availability';
import { categoryLabel } from '../../utils/categories';
import { formatDay, formatMonth, formatPrice, formatTime, hasStarted } from '../../utils/format';

// A few brand-colored banners; the event id picks one, so an event always keeps its look (the API has no images).
const banners = [
  `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
  `linear-gradient(135deg, ${colors.navyDark} 0%, #1F4E79 100%)`,
  `linear-gradient(135deg, ${colors.navyLight} 0%, ${colors.navy} 60%, #3B2F63 100%)`,
  `linear-gradient(135deg, ${colors.charcoal} 0%, ${colors.navy} 100%)`,
];

export function EventCard({ event }: { event: EventSummary }) {
  const availability = availabilityOf(event.availableSeats);
  const over = hasStarted(event.startsAt);
  const soldOut = event.availableSeats <= 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 36px rgba(20, 43, 73, 0.16)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/events/${event.id}`}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', '& .MuiCardActionArea-focusHighlight': { opacity: 0 } }}
        aria-label={`${event.name} - לפרטים והזמנת כרטיסים`}
      >
        {/* banner */}
        <Box sx={{ position: 'relative', height: 150, background: banners[event.id % banners.length], color: colors.white, overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -60, insetInlineEnd: -50, width: 190, height: 190, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.35 }} />
          <Box sx={{ position: 'absolute', top: -20, insetInlineEnd: 20, width: 80, height: 80, borderRadius: '50%', bgcolor: colors.gold, opacity: 0.12 }} />
          <ConfirmationNumberRoundedIcon
            sx={{ position: 'absolute', insetInlineEnd: 18, bottom: -22, fontSize: 130, opacity: 0.14, color: colors.gold, transform: 'rotate(-12deg)' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 14,
              insetInlineStart: 14,
              minWidth: 56,
              px: 1,
              py: 0.75,
              textAlign: 'center',
              lineHeight: 1,
              borderRadius: '14px',
              bgcolor: colors.white,
              color: colors.navy,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            <Typography component="div" sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.05 }}>
              {formatDay(event.startsAt)}
            </Typography>
            <Typography component="div" sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.goldDark }}>
              {formatMonth(event.startsAt)}
            </Typography>
          </Box>
          {over && <Chip label="האירוע התקיים" size="small" sx={{ position: 'absolute', top: 14, insetInlineEnd: 14, bgcolor: 'rgba(255,255,255,0.9)', color: colors.charcoal }} />}
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ position: 'absolute', bottom: 12, insetInlineStart: 14, insetInlineEnd: 14, flexWrap: 'wrap' }}>
            {event.categories.map((category) => (
              <Chip
                key={category}
                label={categoryLabel(category)}
                size="small"
                sx={{ bgcolor: colors.gold, color: colors.navy, fontWeight: 700 }}
              />
            ))}
          </Stack>
        </Box>

        {/* details */}
        <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 800, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.6em' }}
          >
            {event.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <PlaceRoundedIcon fontSize="small" sx={{ color: colors.gold }} />
            <Typography variant="body2" noWrap>{event.venue}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <AccessTimeRoundedIcon fontSize="small" sx={{ color: colors.gold }} />
            <Typography variant="body2">שעה {formatTime(event.startsAt)}</Typography>
          </Stack>
        </Box>
      </CardActionArea>

      {/* footer */}
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.75 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">מחיר לכרטיס</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1, color: colors.navy }}>
              {formatPrice(event.ticketPrice)}
            </Typography>
          </Box>
          <Chip label={availability.label} color={availability.color} variant={soldOut ? 'filled' : 'outlined'} size="small" />
        </Stack>
        <Button
          component={RouterLink}
          to={`/events/${event.id}`}
          variant={soldOut || over ? 'outlined' : 'contained'}
          color={soldOut || over ? 'primary' : 'secondary'}
          fullWidth
        >
          {soldOut || over ? 'לפרטי האירוע' : 'להזמנת כרטיסים'}
        </Button>
      </Box>
    </Card>
  );
}
