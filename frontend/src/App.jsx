import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Layout } from '@/components/layout';
import { AuthProvider, useAuth, AdminRoute } from '@/lib/auth-context';
import { Login } from '@/pages/login';
import { ForgotPassword } from '@/pages/forgot-password';
import { ResetPassword } from '@/pages/reset-password';
import { Account } from '@/pages/account';
import NotFound from '@/pages/not-found';
import { Dashboard } from '@/pages/dashboard';
import { CasesList } from '@/pages/cases';
import { CasesNew } from '@/pages/cases-new';
import { CasesDetail } from '@/pages/cases-detail';
import { CasesReport } from '@/pages/cases-report';
import { ChildrenList } from '@/pages/children';
import { ChildrenNew } from '@/pages/children-new';
import { ChildrenDetail } from '@/pages/children-detail';
import { WorkersList } from '@/pages/workers';
import { WorkersNew } from '@/pages/workers-new';
import { WorkersDetail } from '@/pages/workers-detail';
import { ReportsList } from '@/pages/reports';
import { ReportsNew } from '@/pages/reports-new';
import { ReportsDetail } from '@/pages/reports-detail';
import { InvestigationsList } from '@/pages/investigations';
import { InvestigationsNew } from '@/pages/investigations-new';
import { InvestigationsDetail } from '@/pages/investigations-detail';
import { UsersList } from '@/pages/users';

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/cases/new" component={CasesNew} />
        <Route path="/cases/:id" component={CasesDetail} />
        <Route path="/cases" component={CasesList} />
        <Route path="/children/new" component={ChildrenNew} />
        <Route path="/children/:id" component={ChildrenDetail} />
        <Route path="/children" component={ChildrenList} />
        <Route path="/workers/new" component={WorkersNew} />
        <Route path="/workers/:id" component={WorkersDetail} />
        <Route path="/workers" component={WorkersList} />
        <Route path="/reports/new" component={ReportsNew} />
        <Route path="/reports/:id" component={ReportsDetail} />
        <Route path="/reports" component={ReportsList} />
        <Route path="/investigations/new" component={InvestigationsNew} />
        <Route path="/investigations/:id" component={InvestigationsDetail} />
        <Route path="/investigations" component={InvestigationsList} />
        <Route path="/users" component={() => <AdminRoute component={UsersList} />} />
        <Route path="/account" component={Account} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// The report is deliberately rendered WITHOUT the app's sidebar/nav Layout —
// it's meant to be printed/saved as a clean document, not browsed. Still
// requires being logged in, same as everything else.
function CasesReportRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <CasesReport />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/cases/:id/report" component={CasesReportRoute} />
      <Route><AuthenticatedApp /></Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
