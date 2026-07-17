import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect } from 'wouter';
import {
  getToken, setToken, useMe, useLogin, useGetMyWorker,
  AUTH_EXPIRED_EVENT, getMeQueryKey,
} from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(!!getToken());
  const { data: user, isLoading, isError } = useMe({ query: { enabled: hasToken } });
  const login = useLogin();
  // Resolves the staff/worker record linked to this login (see Workers >
  // "Login Account"). Powers "my cases" and staff-role permission checks
  // like canCloseEscalatedCases below. Mirrored (and re-checked) on the
  // backend — this is for UI purposes, not the source of truth.
  const { data: myWorker } = useGetMyWorker({ query: { enabled: hasToken } });

  // If /auth/me comes back 401 (expired/invalid token), drop the session.
  useEffect(() => {
    const onExpired = () => setHasToken(false);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const signIn = useCallback((email, password) => (
    login.mutateAsync({ email, password }).then((res) => {
      setToken(res.token);
      qc.setQueryData(getMeQueryKey(), res.user);
      setHasToken(true);
      return res.user;
    })
  ), [login, qc]);

  const signOut = useCallback(() => {
    setToken(null);
    setHasToken(false);
    qc.setQueryData(getMeQueryKey(), null);
    qc.clear();
  }, [qc]);

  const isAdmin = hasToken && user?.role === 'admin';
  const workerRole = myWorker?.role ?? null;
  const value = {
    user: hasToken ? user : null,
    isAuthenticated: hasToken && !!user && !isError,
    isAdmin,
    workerRole,
    // Mirrors Auth::requireCaseClosePermission() on the backend: a
    // login-level admin, or a worker tagged supervisor/admin, may close a
    // case that's currently escalated. Used to disable that option in the
    // UI — the backend enforces it regardless, this is just so people
    // aren't surprised by a rejected save.
    canCloseEscalatedCases: isAdmin || ['supervisor', 'admin'].includes(workerRole),
    // Only investigator-tagged workers can be assigned to run an
    // investigation — the backend enforces this on save; this is exposed
    // so the assignment dropdown itself can be filtered to valid choices.
    isInvestigator: workerRole === 'investigator',
    // Only show a loading state when we actually have a token to check.
    isLoading: hasToken && isLoading,
    signIn,
    signOut,
    loginError: login.error,
    isLoggingIn: login.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/** Wrap a page component: redirects to /login if not signed in. */
export function ProtectedRoute({ component: Component }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

/** Wrap a page component: redirects non-admins to the dashboard. */
export function AdminRoute({ component: Component }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/dashboard" />;
  return <Component />;
}
