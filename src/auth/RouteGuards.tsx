import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Only logged-in users get through; others are sent to the login page and brought back afterwards. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/**
 * Only admins get through. This is a convenience for the UI - the real protection is the server's [Authorize(Roles = "Admin")];
 * a regular user who forces the URL would still get 403 from every admin endpoint.
 */
export function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}

/** Login/register pages make no sense for someone who is already logged in. */
export function RedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/events" replace /> : <Outlet />;
}
