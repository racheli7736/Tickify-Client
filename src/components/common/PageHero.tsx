import { Box, Container, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../theme/theme';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** Extra space at the bottom, so a card (e.g. the filters) can overlap the hero. */
  overlap?: boolean;
  children?: ReactNode;
}

/** The navy banner at the top of the main screens. */
export function PageHero({ title, subtitle, overlap = false, children }: PageHeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: colors.white,
        pt: { xs: 5, md: 7 },
        pb: { xs: overlap ? 9 : 5, md: overlap ? 11 : 7 },
        background: `radial-gradient(circle at 85% 0%, ${colors.navyLight} 0%, transparent 50%), linear-gradient(160deg, ${colors.navy} 0%, ${colors.navyDark} 100%)`,
      }}
    >
      <Box sx={{ position: 'absolute', top: -140, left: -100, width: 360, height: 360, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.22 }} />
      <Box sx={{ position: 'absolute', bottom: -180, right: '25%', width: 380, height: 380, borderRadius: '50%', border: `2px solid ${colors.gold}`, opacity: 0.14 }} />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 620 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}
