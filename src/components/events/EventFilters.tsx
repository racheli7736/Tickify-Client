import { MenuItem, Paper, TextField } from '@mui/material';
import type { Category } from '../../types/api';
import { SearchField } from '../common/SearchField';
import { categoryLabel } from '../../utils/categories';
import { sortOptions } from '../../utils/eventSort';

interface EventFiltersProps {
  search: string;
  categoryId?: number;
  sort: string;
  categories: Category[];
  onSearch: (text: string) => void;
  onCategory: (id: number | undefined) => void;
  onSort: (value: string) => void;
}

export function EventFilters({ search, categoryId, sort, categories, onSearch, onCategory, onSort }: EventFiltersProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr 1fr' },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 12px 40px rgba(20, 43, 73, 0.12)',
      }}
    >
      <SearchField value={search} onSearch={onSearch} />

      <TextField
        select
        label="קטגוריה"
        value={categoryId ?? ''}
        onChange={(event) => onCategory(event.target.value === '' ? undefined : Number(event.target.value))}
        slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
      >
        <MenuItem value="">כל הקטגוריות</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {categoryLabel(category.name)}
          </MenuItem>
        ))}
      </TextField>

      <TextField select label="מיון" value={sort} onChange={(event) => onSort(event.target.value)}>
        {sortOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Paper>
  );
}
