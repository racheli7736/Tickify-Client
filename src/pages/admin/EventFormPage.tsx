import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Checkbox, Chip, CircularProgress, Container, ListItemText, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { categoriesApi } from '../../api/categories.api';
import { eventsApi } from '../../api/events.api';
import { toApiError } from '../../api/errors';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHero } from '../../components/common/PageHero';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../hooks/useToast';
import type { Category, EventDetails } from '../../types/api';
import { colors } from '../../theme/theme';
import { categoryLabel } from '../../utils/categories';
import { fromLocalInputValue, toLocalInputValue } from '../../utils/format';
import { muiRegister } from '../../utils/forms';

interface EventFormValues {
  name: string;
  description: string;
  venue: string;
  startsAt: string;
  ticketPrice: number;
  rows: number;
  seatsPerRow: number;
  categoryIds: number[];
}

const numberField = (label: string) => yup.number().typeError(`${label}: יש להזין מספר`).required(`יש להזין ${label}`);

/**
 * The limits mirror the API's CreateEventRequest / UpdateEventRequest.
 * The date must be in the future - except when an existing event keeps its original date (the server allows that).
 */
function buildSchema(originalStartsAt: string | null): yup.ObjectSchema<EventFormValues> {
  return yup.object({
    name: yup.string().trim().required('יש להזין שם לאירוע').min(2, 'השם חייב להכיל לפחות 2 תווים').max(200, 'השם יכול להכיל עד 200 תווים'),
    description: yup.string().max(2000, 'התיאור יכול להכיל עד 2000 תווים').default(''),
    venue: yup.string().trim().required('יש להזין מקום').max(200, 'המקום יכול להכיל עד 200 תווים'),
    startsAt: yup
      .string()
      .required('יש לבחור תאריך ושעה')
      .test('future', 'התאריך חייב להיות בעתיד', (value) => {
        if (!value) return false;
        if (originalStartsAt && value === originalStartsAt) return true;
        return new Date(value).getTime() > Date.now();
      }),
    ticketPrice: numberField('מחיר').min(0.01, 'המחיר חייב להיות לפחות 0.01').max(100000, 'המחיר המקסימלי הוא 100,000'),
    rows: numberField('מספר שורות').integer('יש להזין מספר שלם').min(1, 'לפחות שורה אחת').max(50, 'עד 50 שורות'),
    seatsPerRow: numberField('מספר מושבים בשורה').integer('יש להזין מספר שלם').min(1, 'לפחות מושב אחד').max(100, 'עד 100 מושבים בשורה'),
    categoryIds: yup.array(yup.number().required()).default([]),
  });
}

interface EventFormProps {
  /** Present when editing. */
  event?: EventDetails;
  categories: Category[];
}

function EventForm({ event, categories }: EventFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(event);
  const originalLocal = event ? toLocalInputValue(event.startsAt) : null;
  const schema = useMemo(() => buildSchema(originalLocal), [originalLocal]);
  const [error, setError] = useState<string | null>(null);

  const defaults: EventFormValues = {
    name: event?.name ?? '',
    description: event?.description ?? '',
    venue: event?.venue ?? '',
    startsAt: originalLocal ?? '',
    ticketPrice: event?.ticketPrice ?? 100,
    rows: event?.rows ?? 5,
    seatsPerRow: event?.seatsPerRow ?? 10,
    // the API returns category names; the form works with ids
    categoryIds: event ? categories.filter((category) => event.categories.includes(category.name)).map((category) => category.id) : [],
  };

  const {
    register,
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({ resolver: yupResolver(schema), defaultValues: defaults });

  const rows = useWatch({ control, name: 'rows' });
  const seatsPerRow = useWatch({ control, name: 'seatsPerRow' });
  const totalSeats = Number.isFinite(rows) && Number.isFinite(seatsPerRow) ? rows * seatsPerRow : 0;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    // An untouched date is sent back exactly as the server gave it.
    const startsAt = event && values.startsAt === originalLocal ? event.startsAt : fromLocalInputValue(values.startsAt);
    const common = {
      name: values.name.trim(),
      description: values.description.trim(),
      venue: values.venue.trim(),
      startsAt,
      ticketPrice: values.ticketPrice,
      categoryIds: values.categoryIds,
    };
    try {
      if (event) {
        await eventsApi.update(event.id, common);
        toast.show('האירוע עודכן');
      } else {
        await eventsApi.create({ ...common, rows: values.rows, seatsPerRow: values.seatsPerRow });
        toast.show('האירוע נוצר, וכל המושבים שלו נוצרו');
      }
      navigate('/admin/events');
    } catch (caught) {
      const apiError = toApiError(caught);
      for (const [field, message] of Object.entries(apiError.fieldErrors)) {
        if (field in defaults) setFieldError(field as keyof EventFormValues, { type: 'server', message });
      }
      setError(apiError.status === 404 ? 'האירוע לא נמצא (ייתכן שנמחק).' : apiError.message);
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Card sx={{ p: { xs: 2.5, md: 4 } }}>
        {error && <Alert severity="error" role="alert" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <TextField label="שם האירוע" autoFocus error={Boolean(errors.name)} helperText={errors.name?.message} {...muiRegister(register('name'))} />
          </Box>
          <TextField label="מקום" error={Boolean(errors.venue)} helperText={errors.venue?.message} {...muiRegister(register('venue'))} />
          <TextField
            label="תאריך ושעה"
            type="datetime-local"
            error={Boolean(errors.startsAt)}
            helperText={errors.startsAt?.message}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { dir: 'ltr', style: { textAlign: 'right' } } }}
            {...muiRegister(register('startsAt'))}
          />
          <TextField
            label="מחיר לכרטיס (₪)"
            type="number"
            error={Boolean(errors.ticketPrice)}
            helperText={errors.ticketPrice?.message}
            slotProps={{ htmlInput: { step: 0.01, min: 0.01, dir: 'ltr', style: { textAlign: 'right' } } }}
            {...muiRegister(register('ticketPrice', { valueAsNumber: true }))}
          />
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <TextField
                select
                label="קטגוריות"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) => (
                      <Stack direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                        {(selected as number[]).map((id) => {
                          const category = categories.find((item) => item.id === id);
                          return category ? <Chip key={id} size="small" label={categoryLabel(category.name)} /> : null;
                        })}
                      </Stack>
                    ),
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox checked={field.value.includes(category.id)} />
                    <ListItemText primary={categoryLabel(category.name)} secondary={categoryLabel(category.name) !== category.name ? category.name : undefined} />
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <TextField label="תיאור" multiline minRows={3} error={Boolean(errors.description)} helperText={errors.description?.message} {...muiRegister(register('description'))} />
          </Box>
        </Box>

        {/* the seat structure is fixed when the event is created */}
        <Box sx={{ mt: 3.5, p: 2.5, borderRadius: '16px', bgcolor: colors.softBlue }}>
          <Typography sx={{ fontWeight: 800, mb: 1.5 }}>מבנה המושבים</Typography>
          {isEdit ? (
            <Typography color="text.secondary">
              האולם כולל {event?.rows} שורות × {event?.seatsPerRow} מושבים. מבנה המושבים נקבע בעת יצירת האירוע ואי אפשר לשנותו.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                <TextField label="מספר שורות (1-50)" type="number" error={Boolean(errors.rows)} helperText={errors.rows?.message} slotProps={{ htmlInput: { min: 1, max: 50, dir: 'ltr', style: { textAlign: 'right' } } }} {...muiRegister(register('rows', { valueAsNumber: true }))} />
                <TextField label="מושבים בכל שורה (1-100)" type="number" error={Boolean(errors.seatsPerRow)} helperText={errors.seatsPerRow?.message} slotProps={{ htmlInput: { min: 1, max: 100, dir: 'ltr', style: { textAlign: 'right' } } }} {...muiRegister(register('seatsPerRow', { valueAsNumber: true }))} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} data-testid="seat-total">
                יווצרו {totalSeats} מושבים באופן אוטומטי. אחרי היצירה אי אפשר לשנות את המבנה.
              </Typography>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/events')} disabled={isSubmitting} size="large">
            ביטול
          </Button>
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={isSubmitting} sx={{ minWidth: 160 }}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'שמירת שינויים' : 'יצירת האירוע'}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

/** Admin: one form for both creating (/admin/events/new) and editing (/admin/events/:id/edit). */
export function EventFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const eventId = Number(id);
  const navigate = useNavigate();

  const categories = useApiQuery('form-categories', (signal) => categoriesApi.list(signal));
  const event = useApiQuery(isEdit ? `form-event-${id}` : 'form-new', (signal) => (isEdit ? eventsApi.get(eventId, signal) : Promise.resolve(undefined)));

  let content;
  if (isEdit && (!Number.isInteger(eventId) || event.error?.status === 404)) {
    content = <EmptyState title="האירוע לא נמצא" text="ייתכן שהאירוע נמחק או שהקישור שגוי." actionLabel="חזרה לניהול אירועים" onAction={() => navigate('/admin/events')} />;
  } else if (event.error) {
    content = <ErrorState error={event.error} onRetry={event.reload} />;
  } else if (categories.error) {
    content = <ErrorState error={categories.error} onRetry={categories.reload} />;
  } else if (!categories.data || (isEdit && !event.data)) {
    content = <Skeleton variant="rounded" height={520} aria-busy />;
  } else {
    content = <EventForm key={event.data?.id ?? 'new'} event={event.data} categories={categories.data} />;
  }

  return (
    <>
      <PageHero title={isEdit ? 'עריכת אירוע' : 'אירוע חדש'} subtitle={isEdit ? 'עדכון פרטי האירוע והקטגוריות שלו.' : 'מלאי את הפרטים. המושבים ייווצרו אוטומטית לפי מספר השורות והמושבים.'} />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>{content}</Container>
    </>
  );
}
