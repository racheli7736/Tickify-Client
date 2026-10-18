import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { categoriesApi } from '../../api/categories.api';
import { toApiError } from '../../api/errors';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHero } from '../../components/common/PageHero';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../hooks/useToast';
import type { Category } from '../../types/api';
import { colors } from '../../theme/theme';
import { categoryLabel } from '../../utils/categories';
import { muiRegister } from '../../utils/forms';

interface CategoryForm {
  name: string;
}

// The limits mirror the API's CategoryRequest (2-100 characters).
const schema: yup.ObjectSchema<CategoryForm> = yup.object({
  name: yup.string().trim().required('יש להזין שם קטגוריה').min(2, 'השם חייב להכיל לפחות 2 תווים').max(100, 'השם יכול להכיל עד 100 תווים'),
});

const NAME_TAKEN = 'כבר קיימת קטגוריה בשם הזה (ללא הבדל בין אותיות גדולות וקטנות)';

interface CategoryDialogProps {
  /** null = create a new category; a category = rename it. */
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function CategoryDialog({ category, open, onClose, onSaved }: CategoryDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({ resolver: yupResolver(schema), defaultValues: { name: category?.name ?? '' } });

  const submit = handleSubmit(async ({ name }) => {
    setError(null);
    try {
      if (category) {
        await categoriesApi.rename(category.id, { name: name.trim() });
        onSaved('הקטגוריה עודכנה');
      } else {
        await categoriesApi.create({ name: name.trim() });
        onSaved('הקטגוריה נוצרה');
      }
    } catch (caught) {
      const apiError = toApiError(caught);
      if (apiError.status === 409) setFieldError('name', { type: 'server', message: NAME_TAKEN });
      else setError(apiError.message);
    }
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="xs" aria-labelledby="category-dialog-title">
      <Box component="form" onSubmit={submit} noValidate>
        <DialogTitle id="category-dialog-title" sx={{ fontWeight: 800 }}>
          {category ? 'שינוי שם קטגוריה' : 'קטגוריה חדשה'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="שם הקטגוריה"
            autoFocus
            sx={{ mt: 1 }}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...muiRegister(register('name'))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={onClose} disabled={isSubmitting}>ביטול</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting} sx={{ minWidth: 110 }}>
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'שמירה'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/** Admin: create, rename and delete categories. */
export function AdminCategoriesPage() {
  const toast = useToast();
  const categories = useApiQuery('admin-categories', (signal) => categoriesApi.list(signal));

  // `dialog`: undefined = closed, null = create, Category = rename. The key remounts the form with fresh values.
  const [dialog, setDialog] = useState<Category | null | undefined>(undefined);
  const [dialogKey, setDialogKey] = useState(0);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDialog = (category: Category | null) => {
    setDialogKey((key) => key + 1);
    setDialog(category);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoriesApi.remove(toDelete.id);
      toast.show('הקטגוריה נמחקה');
      setToDelete(null);
      categories.reload();
    } catch (caught) {
      const apiError = toApiError(caught);
      setDeleteError(apiError.status === 409 ? 'לא ניתן למחוק קטגוריה ששייכת לאירועים. יש להסיר אותה מהאירועים קודם.' : apiError.message);
      if (apiError.status === 404) categories.reload();
    } finally {
      setDeleting(false);
    }
  };

  const list = categories.data;

  return (
    <>
      <PageHero title="ניהול קטגוריות" subtitle="הקטגוריות משמשות לסיווג האירועים ולסינון ברשימת האירועים." />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack direction="row" sx={{ mb: 2.5, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" aria-live="polite" sx={{ fontWeight: 700 }}>
            {list ? `${list.length} קטגוריות` : 'טוענת קטגוריות...'}
          </Typography>
          <Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => openDialog(null)}>
            קטגוריה חדשה
          </Button>
        </Stack>

        {!list && categories.loading && <Skeleton variant="rounded" height={300} aria-busy />}
        {categories.error && <ErrorState error={categories.error} onRetry={categories.reload} />}
        {!categories.error && list && list.length === 0 && (
          <EmptyState icon={<CategoryRoundedIcon fontSize="large" />} title="אין קטגוריות עדיין" text="צרי קטגוריה ראשונה כדי לסווג אירועים." actionLabel="קטגוריה חדשה" onAction={() => openDialog(null)} />
        )}

        {!categories.error && list && list.length > 0 && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />} aria-label="רשימת קטגוריות" role="list">
              {list.map((category) => (
                <Stack key={category.id} role="listitem" data-testid="category-row" direction="row" spacing={2} sx={{ px: 3, py: 2, alignItems: 'center', '&:hover': { bgcolor: colors.softBlue } }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: colors.softBlue, color: colors.gold }}>
                    <CategoryRoundedIcon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }} noWrap>{category.name}</Typography>
                    {categoryLabel(category.name) !== category.name && (
                      <Chip size="small" label={`מוצגת למשתמשים כ: ${categoryLabel(category.name)}`} sx={{ mt: 0.5 }} />
                    )}
                  </Box>
                  <Tooltip title="שינוי שם" describeChild>
                    <IconButton aria-label={`שינוי שם: ${category.name}`} onClick={() => openDialog(category)}>
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="מחיקה" describeChild>
                    <IconButton aria-label={`מחיקה: ${category.name}`} color="error" onClick={() => { setDeleteError(null); setToDelete(category); }}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}
      </Container>

      {dialog !== undefined && (
        <CategoryDialog
          key={dialogKey}
          category={dialog}
          open
          onClose={() => setDialog(undefined)}
          onSaved={(message) => {
            setDialog(undefined);
            toast.show(message);
            categories.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="מחיקת קטגוריה"
        confirmLabel="מחיקה"
        danger
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        האם למחוק את הקטגוריה <strong>{toDelete?.name}</strong>? אי אפשר למחוק קטגוריה ששייכת לאירועים.
      </ConfirmDialog>
    </>
  );
}
