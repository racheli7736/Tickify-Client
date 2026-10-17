import { Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** The white rounded card that holds the login and register forms. */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card sx={{ borderRadius: '24px', boxShadow: '0 20px 60px rgba(20, 43, 73, 0.12)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3.5 }}>
          {subtitle}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}
