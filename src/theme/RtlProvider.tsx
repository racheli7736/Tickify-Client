import { useMemo, type ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { theme } from './theme';

/** Flips MUI's emotion styles for right-to-left (Hebrew) and applies the shared theme to the whole app. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const cache = useMemo(
    () => createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] }),
    [],
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
