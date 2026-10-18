import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectIfAuthenticated, RequireAdmin, RequireAuth } from '../auth/RouteGuards';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { EventFormPage } from '../pages/admin/EventFormPage';
import { EventDetailsPage } from '../pages/EventDetailsPage';
import { EventsPage } from '../pages/EventsPage';
import { LoginPage } from '../pages/LoginPage';
import { OrdersPage } from '../pages/OrdersPage';
import { RegisterPage } from '../pages/RegisterPage';
import { StatusPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />

      {/* login / register: only for visitors who are not logged in */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        {/* any logged-in user */}
        <Route element={<RequireAuth />}>
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        {/* admins only (the server enforces this too) */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/new" element={<EventFormPage />} />
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Route>

        <Route path="/forbidden" element={<StatusPage code="403" />} />
        <Route path="*" element={<StatusPage code="404" />} />
      </Route>
    </Routes>
  );
}
