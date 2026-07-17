import { useQuery, useMutation } from '@tanstack/react-query';

const BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'cams.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

/** Fired when a request comes back 401, so the app can drop the session. */
export const AUTH_EXPIRED_EVENT = 'cams:auth-expired';

async function req(method, path, body) {
  const token = getToken();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && path !== '/auth/login') {
    setToken(null);
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export const getMeQueryKey = () => ['auth', 'me'];
export const getListUsersQueryKey = () => ['users'];

export const useLogin = () =>
  useMutation({
    mutationFn: ({ email, password }) =>
      req('POST', '/auth/login', { email, password }),
  });
export const useMe = (opts) =>
  useQuery({
    queryKey: getMeQueryKey(),
    queryFn: () => req('GET', '/auth/me'),
    retry: false,
    ...opts?.query,
  });
export const useForgotPassword = () =>
  useMutation({
    mutationFn: ({ email }) => req('POST', '/auth/forgot-password', { email }),
  });
export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ token, password }) =>
      req('POST', '/auth/reset-password', { token, password }),
  });
export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      req('POST', '/auth/change-password', { currentPassword, newPassword }),
  });
export const useSendResetLink = () =>
  useMutation({
    mutationFn: ({ id }) => req('POST', '/users/' + id + '/send-reset-link'),
  });

export const useListUsers = (opts) =>
  useQuery({
    queryKey: getListUsersQueryKey(),
    queryFn: () => req('GET', '/users'),
    ...opts?.query,
  });
export const useCreateUser = () =>
  useMutation({ mutationFn: ({ data }) => req('POST', '/users', data) });
export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/users/' + id, data),
  });
export const useDeleteUser = () =>
  useMutation({ mutationFn: ({ id }) => req('DELETE', '/users/' + id) });

export const getGetDashboardSummaryQueryKey = () => ['dashboard-summary'];
export const getListCasesQueryKey = () => ['cases'];
export const getGetCaseQueryKey = (id) => ['cases', id];
export const getListCaseNotesQueryKey = (id) => ['case-notes', id];
export const getListChildrenQueryKey = () => ['children'];
export const getGetChildQueryKey = (id) => ['children', id];
export const getListWorkersQueryKey = () => ['workers'];
export const getGetWorkerQueryKey = (id) => ['workers', id];
export const getListReportsQueryKey = () => ['reports'];
export const getGetReportQueryKey = (id) => ['reports', id];
export const getListInvestigationsQueryKey = () => ['investigations'];
export const getGetInvestigationQueryKey = (id) => ['investigations', id];

export const useGetDashboardSummary = (opts) =>
  useQuery({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => req('GET', '/dashboard/summary'),
    ...opts?.query,
  });

export const useListCases = (opts) => {
  const mine = opts?.assignedToMe ? '?assignedToMe=1' : '';
  return useQuery({
    queryKey: opts?.assignedToMe
      ? [...getListCasesQueryKey(), 'mine']
      : getListCasesQueryKey(),
    queryFn: () => req('GET', '/cases' + mine),
    ...opts?.query,
  });
};
export const useGetCase = (id, opts) =>
  useQuery({
    queryKey: getGetCaseQueryKey(id),
    queryFn: () => req('GET', '/cases/' + id),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateCase = () =>
  useMutation({ mutationFn: ({ data }) => req('POST', '/cases', data) });
export const useUpdateCase = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/cases/' + id, data),
  });
export const useDeleteCase = () =>
  useMutation({ mutationFn: ({ id }) => req('DELETE', '/cases/' + id) });

export const useListCaseNotes = (id, opts) =>
  useQuery({
    queryKey: getListCaseNotesQueryKey(id),
    queryFn: () => req('GET', '/cases/' + id + '/notes'),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateCaseNote = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('POST', '/cases/' + id + '/notes', data),
  });

export const useListChildren = (opts) =>
  useQuery({
    queryKey: getListChildrenQueryKey(),
    queryFn: () => req('GET', '/children'),
    ...opts?.query,
  });
export const useGetChild = (id, opts) =>
  useQuery({
    queryKey: getGetChildQueryKey(id),
    queryFn: () => req('GET', '/children/' + id),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateChild = () =>
  useMutation({ mutationFn: ({ data }) => req('POST', '/children', data) });
export const useUpdateChild = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/children/' + id, data),
  });

export const useListWorkers = (opts) =>
  useQuery({
    queryKey: getListWorkersQueryKey(),
    queryFn: () => req('GET', '/workers'),
    ...opts?.query,
  });
// Resolves the current login's linked staff-directory record (or null if
// this account isn't linked to one yet). Powers "my cases" everywhere.
export const getMyWorkerQueryKey = () => ['workers', 'me'];
export const useGetMyWorker = (opts) =>
  useQuery({
    queryKey: getMyWorkerQueryKey(),
    queryFn: () => req('GET', '/workers/me'),
    ...opts?.query,
  });
export const useGetWorker = (id, opts) =>
  useQuery({
    queryKey: getGetWorkerQueryKey(id),
    queryFn: () => req('GET', '/workers/' + id),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateWorker = () =>
  useMutation({ mutationFn: ({ data }) => req('POST', '/workers', data) });
export const useUpdateWorker = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/workers/' + id, data),
  });

export const useListReports = (opts) =>
  useQuery({
    queryKey: getListReportsQueryKey(),
    queryFn: () => req('GET', '/reports'),
    ...opts?.query,
  });
export const useGetReport = (id, opts) =>
  useQuery({
    queryKey: getGetReportQueryKey(id),
    queryFn: () => req('GET', '/reports/' + id),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateReport = () =>
  useMutation({ mutationFn: ({ data }) => req('POST', '/reports', data) });
export const useUpdateReport = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/reports/' + id, data),
  });

export const useListInvestigations = (opts) =>
  useQuery({
    queryKey: getListInvestigationsQueryKey(),
    queryFn: () => req('GET', '/investigations'),
    ...opts?.query,
  });
export const useGetInvestigation = (id, opts) =>
  useQuery({
    queryKey: getGetInvestigationQueryKey(id),
    queryFn: () => req('GET', '/investigations/' + id),
    enabled: !!id,
    ...opts?.query,
  });
export const useCreateInvestigation = () =>
  useMutation({
    mutationFn: ({ data }) => req('POST', '/investigations', data),
  });
export const useUpdateInvestigation = () =>
  useMutation({
    mutationFn: ({ id, data }) => req('PATCH', '/investigations/' + id, data),
  });
