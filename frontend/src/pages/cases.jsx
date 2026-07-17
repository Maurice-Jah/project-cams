import { useListCases } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';

export function CasesList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const statusFilter = params.get('status');
  const priorityFilter = params.get('priority');
  const mineOnly = params.get('assignedToMe') === '1';
  const { user } = useAuth();

  const { data: cases, isLoading, error } = useListCases({ assignedToMe: mineOnly });

  const filtered = (cases ?? []).filter(c =>
    (!statusFilter || c.status === statusFilter) &&
    (!priorityFilter || c.priority === priorityFilter)
  );

  const activeFilters = [
    mineOnly && { label: 'Assigned to me', href: '/cases' },
    statusFilter && { label: `Status: ${statusFilter.replace(/_/g,' ')}`, href: mineOnly ? '/cases?assignedToMe=1' : '/cases' },
    priorityFilter && { label: `Priority: ${priorityFilter}`, href: mineOnly ? '/cases?assignedToMe=1' : '/cases' },
  ].filter(Boolean);

  if (error) return <div className="text-destructive p-4">Failed to load cases</div>;
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cases Directory</h1><p className="text-muted-foreground mt-1 text-sm">Manage and track all child welfare cases.</p></div>
        <Link href="/cases/new"><Button className="gap-2 w-full sm:w-auto"><PlusCircle className="h-4 w-4"/>New Case</Button></Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={mineOnly ? '/cases' : '/cases?assignedToMe=1'}>
          <Button variant={mineOnly ? 'default' : 'outline'} size="sm">My Cases</Button>
        </Link>
        {activeFilters.map((f,i)=>(
          <Link key={i} href={f.href}>
            <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground hover:bg-muted/70 cursor-pointer">
              {f.label}<X className="h-3 w-3"/>
            </span>
          </Link>
        ))}
      </div>

      <div className="space-y-3 sm:hidden">
        {isLoading?[1,2,3].map(i=><Skeleton key={i} className="h-24 rounded-xl"/>):filtered.map(c=>(
          <Link key={c.id} href={'/cases/'+c.id}>
            <div className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
              <div className="space-y-1.5"><p className="font-semibold text-primary">{c.caseNumber}</p><p className="text-xs text-muted-foreground capitalize">{c.abuseType.replace(/_/g,' ')}</p><p className="text-xs text-muted-foreground">{c.worker ? `${c.worker.firstName} ${c.worker.lastName}` : 'Unassigned'}</p></div>
              <div className="flex flex-col items-end gap-1.5"><PriorityBadge priority={c.priority}/><StatusBadge status={c.status}/></div>
            </div>
          </Link>
        ))}
        {!isLoading && filtered.length===0 && <p className="text-center text-muted-foreground py-8 text-sm">No cases found.</p>}
      </div>
      <Card className="shadow-sm hidden sm:block"><div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border"><tr><th className="px-6 py-4 font-medium">Case Number</th><th className="px-6 py-4 font-medium">Reported</th><th className="px-6 py-4 font-medium">Type</th><th className="px-6 py-4 font-medium">Assigned To</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Priority</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr></thead>
          <tbody>
            {isLoading?[1,2,3,4,5].map(i=><tr key={i} className="border-b">{[1,2,3,4,5,6,7].map(j=><td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>)}</tr>):filtered.map(c=>(
              <tr key={c.id} className="border-b hover:bg-muted/30 group">
                <td className="px-6 py-4 font-medium text-primary"><Link href={'/cases/'+c.id} className="hover:underline">{c.caseNumber}</Link></td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(c.reportedAt),'MMM d, yyyy')}</td>
                <td className="px-6 py-4 capitalize">{c.abuseType.replace(/_/g,' ')}</td>
                <td className="px-6 py-4">{c.worker ? <Link href={'/workers/'+c.workerId} className="text-primary hover:underline">{c.worker.firstName} {c.worker.lastName}</Link> : <span className="text-muted-foreground">Unassigned</span>}</td>
                <td className="px-6 py-4"><StatusBadge status={c.status}/></td>
                <td className="px-6 py-4"><PriorityBadge priority={c.priority}/></td>
                <td className="px-6 py-4 text-right"><Link href={'/cases/'+c.id}><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View</Button></Link></td>
              </tr>
            ))}
            {!isLoading&&filtered.length===0&&<tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No cases found.</td></tr>}
          </tbody>
        </table>
      </div></Card>
    </div>
  );
}
