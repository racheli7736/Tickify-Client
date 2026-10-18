import { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface SearchFieldProps {
  value: string;
  onSearch: (text: string) => void;
  label?: string;
  placeholder?: string;
}

/** Search box that reports the text only after the user pauses typing (avoids a request per keystroke). */
export function SearchField({ value, onSearch, label = 'חיפוש אירוע', placeholder = 'שם האירוע...' }: SearchFieldProps) {
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
      label={label}
      placeholder={placeholder}
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
        htmlInput: { 'aria-label': label, maxLength: 100 },
      }}
    />
  );
}
