import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectIfAuthenticated, RequireAdmin, RequireAuth } from '../auth/RouteGuards';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { StatusPage } from '../pages/NotFoundPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />

      {/* login / register: only for visitors who are not logged in */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<PlaceholderPage title="הרשמה" />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        {/* any logged-in user */}
        <Route element={<RequireAuth />}>
          <Route path="/events" element={<PlaceholderPage title="אירועים" />} />
          <Route path="/events/:id" element={<PlaceholderPage title="פרטי אירוע והזמנת מושבים" />} />
          <Route path="/orders" element={<PlaceholderPage title="ההזמנות שלי" />} />
        </Route>

        {/* admins only (the server enforces this too) */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin/events" element={<PlaceholderPage title="ניהול אירועים" />} />
          <Route path="/admin/events/new" element={<PlaceholderPage title="יצירת אירוע" />} />
          <Route path="/admin/events/:id/edit" element={<PlaceholderPage title="עריכת אירוע" />} />
          <Route path="/admin/categories" element={<PlaceholderPage title="ניהול קטגוריות" />} />
          <Route path="/admin/orders" element={<PlaceholderPage title="כל ההזמנות" />} />
        </Route>

        <Route path="/forbidden" element={<StatusPage code="403" />} />
        <Route path="*" element={<StatusPage code="404" />} />
      </Route>
    </Routes>
  );
}
