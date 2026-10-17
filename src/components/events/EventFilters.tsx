import { useEffect, useState } from 'react';
import { IconButton, InputAdornment, MenuItem, Paper, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import type { Category } from '../../types/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { categoryLabel } from '../../utils/categories';
import { sortOptions } from '../../utils/eventSort';

interface SearchFieldProps {
  value: string;
  onSearch: (text: string) => void;
}

/** Search box that reports the text only after the user pauses typing (avoids a request per keystroke). */
function SearchField({ value, onSearch }: SearchFieldProps) {
  const [text, setText] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  const debounced = useDebouncedValue(text, 400);

  // The URL changed from the outside (browser back button, "clear filters"): show it.
  if (value !== seenValue) {
    setSeenValue(value);
    setText(value);
  }

  // The user paused typing: report the text once it differs from what the URL already has.
  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
    // Only a new debounced text may trigger a report; `value` is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <TextField
      label="חיפוש אירוע"
      placeholder="שם האירוע..."
      value={text}
      onChange={(event) => setText(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: text ? (
            <InputAdornment position="end">
              <IconButton edge="end" size="small" aria-label="ניקוי החיפוש" onClick={() => { setText(''); }}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
        htmlInput: { 'aria-label': 'חיפוש אירוע לפי שם', maxLength: 100 },
      }}
    />
  );
}

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
