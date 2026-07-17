import { useListInvestigations } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/badges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
export function InvestigationsList() {
  const { data: invs, isLoading } = useListInvestigations();
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investigations</h1><p className="text-muted-foreground mt-1 text-sm">Track and manage open investigations.</p></div>
        <Link href="/investigations/new"><Button className="gap-2 w-full sm:w-auto"><PlusCircle className="h-4 w-4"/>Start Investigation</Button></Link>
      </div>
      <div className="space-y-3 sm:hidden">
        {isLoading?[1,2,3].map(i=><Skeleton key={i} className="h-20 rounded-xl"/>):invs?.map(inv=>(
          <Link key={inv.id} href={'/investigations/'+inv.id}>
            <div className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30">
              <div className="space-y-1.5"><p className="font-semibold text-primary">Investigation #{inv.id}</p><p className="text-xs text-muted-foreground">Case #{inv.caseId}</p><p className="text-xs text-muted-foreground">Started {format(new Date(inv.startedAt),'MMM d, yyyy')}</p></div>
              <StatusBadge status={inv.status}/>
            </div>
          </Link>
        ))}
      </div>
      <Card className="hidden sm:block"><div className="overflow-x-auto">
        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Case</th><th className="px-6 py-4">Started</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Outcome</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading?[1,2,3].map(i=><tr key={i} className="border-b">{[1,2,3,4,5,6].map(j=><td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>)}</tr>):invs?.map(inv=>(
              <tr key={inv.id} className="border-b hover:bg-muted/30 group">
                <td className="px-6 py-4 font-medium">#{inv.id}</td>
                <td className="px-6 py-4"><Link href={'/cases/'+inv.caseId} className="text-primary hover:underline">#{inv.caseId}</Link></td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.startedAt),'MMM d, yyyy')}</td>
                <td className="px-6 py-4"><StatusBadge status={inv.status}/></td>
                <td className="px-6 py-4 capitalize">{inv.outcome||'Pending'}</td>
                <td className="px-6 py-4 text-right"><Link href={'/investigations/'+inv.id}><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></Card>
    </div>
  );
}
