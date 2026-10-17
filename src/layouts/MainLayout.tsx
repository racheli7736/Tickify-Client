import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../auth/useAuth';
import { colors } from '../theme/theme';

interface NavItem {
  label: string;
  to: string;
}

const userLinks: NavItem[] = [
  { label: 'אירועים', to: '/events' },
  { label: 'ההזמנות שלי', to: '/orders' },
];

const adminLinks: NavItem[] = [
  { label: 'ניהול אירועים', to: '/admin/events' },
  { label: 'ניהול קטגוריות', to: '/admin/categories' },
  { label: 'כל ההזמנות', to: '/admin/orders' },
];

const navLinkSx = {
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 600,
  px: 1.5,
  py: 0.5,
  borderRadius: '10px',
  position: 'relative',
  '&:hover': { color: colors.white, backgroundColor: 'rgba(255,255,255,0.08)' },
  '&.active': { color: colors.gold },
  '&.active::after': {
    content: '""',
    position: 'absolute',
    insetInline: 12,
    bottom: -2,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
} as const;

const currentYear = new Date().getFullYear();

function initialOf(name: string): string {
  return name.trim().charAt(0) || '?';
}

export function MainLayout() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
  const [adminMenu, setAdminMenu] = useState<HTMLElement | null>(null);

  const handleLogout = () => {
    setUserMenu(null);
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const mobileLinks = isAuthenticated ? [...userLinks, ...(isAdmin ? adminLinks : [])] : [];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="primary" elevation={0} sx={{ borderBottom: `3px solid ${colors.gold}` }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 70, gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: isAuthenticated ? 'inline-flex' : 'none', md: 'none' } }}
              aria-label="פתיחת תפריט"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Logo tone="light" to={isAuthenticated ? '/events' : '/login'} />

            {isAuthenticated && (
              <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, ms: 2, marginInlineStart: 3 }}>
                {userLinks.map((link) => (
                  <Button key={link.to} component={NavLink} to={link.to} sx={navLinkSx}>
                    {link.label}
                  </Button>
                ))}
                {isAdmin && (
                  <>
                    <Button
                      sx={navLinkSx}
                      onClick={(event) => setAdminMenu(event.currentTarget)}
                      endIcon={<ExpandMoreRoundedIcon />}
                    >
                      ניהול
                    </Button>
                    <Menu anchorEl={adminMenu} open={Boolean(adminMenu)} onClose={() => setAdminMenu(null)}>
                      {adminLinks.map((link) => (
                        <MenuItem
                          key={link.to}
                          component={NavLink}
                          to={link.to}
                          onClick={() => setAdminMenu(null)}
                          sx={{ fontWeight: 600, color: 'primary.main', minWidth: 190 }}
                        >
                          {link.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </Stack>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {isAuthenticated && user ? (
              <>
                <Button
                  color="inherit"
                  onClick={(event) => setUserMenu(event.currentTarget)}
                  sx={{ gap: 1, borderRadius: '999px', pe: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}
                >
                  <Avatar sx={{ width: 34, height: 34, bgcolor: colors.gold, color: colors.navy, fontWeight: 800 }}>
                    {initialOf(user.fullName)}
                  </Avatar>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>{user.fullName}</Typography>
                  <ExpandMoreRoundedIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
                </Button>
                <Menu anchorEl={userMenu} open={Boolean(userMenu)} onClose={() => setUserMenu(null)}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{user.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isAdmin ? 'מנהל מערכת' : 'משתמש'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ gap: 1, fontWeight: 600 }}>
                    <LogoutRoundedIcon fontSize="small" /> התנתקות
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={NavLink} to="/login" variant="contained" color="secondary">
                התחברות
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 270 }} role="presentation">
          <Box sx={{ p: 2.5, bgcolor: 'primary.main' }}>
            <Logo tone="light" to="/events" />
          </Box>
          <List>
            {mobileLinks.map((link) => (
              <ListItemButton key={link.to} component={NavLink} to={link.to} onClick={() => setDrawerOpen(false)} sx={{ '&.active': { color: colors.goldDark, bgcolor: colors.softBlue } }}>
                <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="התנתקות" slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ bgcolor: colors.softBlue, borderTop: `1px solid ${colors.line}`, py: 3, mt: 6 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo to={isAuthenticated ? '/events' : '/login'} />
            <Typography variant="body2" color="text.secondary">
              © {currentYear} Tickify · פרויקט גמר בקורס <span dir="ltr">.NET</span>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
