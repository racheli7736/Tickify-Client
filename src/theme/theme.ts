import { alpha, createTheme } from '@mui/material/styles';

export const colors = {
  navy: '#142B49',
  navyDark: '#0C1B30',
  navyLight: '#2A4A75',
  gold: '#C9A34E',
  goldLight: '#E3C887',
  goldDark: '#A8842F',
  white: '#FFFFFF',
  softBlue: '#F4F7FB',
  softGray: '#F7F8FA',
  line: '#E3E8EF',
  charcoal: '#2B3544',
};

declare module '@mui/material/styles' {
  interface Palette {
    soft: { blue: string; gray: string; line: string };
  }
  interface PaletteOptions {
    soft?: { blue: string; gray: string; line: string };
  }
}

/** One shared theme for the whole app: white background, navy structure, gold accents, Hebrew + RTL. */
export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: { main: colors.navy, light: colors.navyLight, dark: colors.navyDark, contrastText: colors.white },
    secondary: { main: colors.gold, light: colors.goldLight, dark: colors.goldDark, contrastText: colors.navy },
    background: { default: colors.white, paper: colors.white },
    text: { primary: colors.navy, secondary: '#52627A' },
    divider: colors.line,
    error: { main: '#C0392B' },
    success: { main: '#2E7D5B' },
    warning: { main: '#B7791F' },
    soft: { blue: colors.softBlue, gray: colors.softGray, line: colors.line },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Heebo", "Segoe UI", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontWeight: 800, letterSpacing: '-0.5px' },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 700, textTransform: 'none', fontSize: '1rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.white },
        '::selection': { background: alpha(colors.gold, 0.35) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, padding: '10px 22px' },
        sizeLarge: { padding: '13px 28px', fontSize: '1.05rem' },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: { color: colors.navy, '&:hover': { backgroundColor: colors.goldDark, color: colors.white } },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5, backgroundColor: alpha(colors.navy, 0.04) } },
        },
      ],
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: colors.white,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.navyLight },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.gold, borderWidth: 2 },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { '&.Mui-focused': { color: colors.goldDark } } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${colors.line}`,
          boxShadow: '0 4px 20px rgba(20, 43, 73, 0.06)',
        },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 20 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12, alignItems: 'center' } } },
    MuiLink: { styleOverrides: { root: { color: colors.goldDark, fontWeight: 700, textDecorationColor: colors.gold } } },
  },
});
