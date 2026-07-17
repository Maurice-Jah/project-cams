import { useListReports } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/badges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
export function ReportsList() {
  const { data: reports, isLoading } = useListReports();
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Incoming Reports</h1><p className="text-muted-foreground mt-1 text-sm">Review and process abuse reports.</p></div>
        <Link href="/reports/new"><Button className="gap-2 w-full sm:w-auto"><PlusCircle className="h-4 w-4"/>New Report</Button></Link>
      </div>
      <div className="space-y-3 sm:hidden">
        {isLoading?[1,2,3].map(i=><Skeleton key={i} className="h-20 rounded-xl"/>):reports?.map(r=>(
          <Link key={r.id} href={'/reports/'+r.id}>
            <div className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30">
              <div className="space-y-1.5"><p className="font-semibold text-primary">{r.reporterName}</p><p className="text-xs text-muted-foreground capitalize">{r.abuseType} abuse</p><p className="text-xs text-muted-foreground">{format(new Date(r.reportedAt),'MMM d, yyyy')}</p></div>
              <StatusBadge status={r.status}/>
            </div>
          </Link>
        ))}
      </div>
      <Card className="hidden sm:block"><div className="overflow-x-auto">
        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b"><tr><th className="px-6 py-4">Reporter</th><th className="px-6 py-4">Child</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading?[1,2,3].map(i=><tr key={i} className="border-b">{[1,2,3,4,5,6].map(j=><td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>)}</tr>):reports?.map(r=>(
              <tr key={r.id} className="border-b hover:bg-muted/30 group">
                <td className="px-6 py-4 font-medium">{r.reporterName}</td>
                <td className="px-6 py-4">{[r.childFirstName,r.childLastName].filter(Boolean).join(' ')||'—'}</td>
                <td className="px-6 py-4 capitalize">{r.abuseType}</td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(r.reportedAt),'MMM d, yyyy')}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status}/></td>
                <td className="px-6 py-4 text-right"><Link href={'/reports/'+r.id}><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Review</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></Card>
    </div>
  );
}
