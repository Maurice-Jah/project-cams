import { useListWorkers } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/badges';
import { AvatarInitials } from '@/components/avatar-initials';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
const ROLES = { social_worker:'Social Worker', supervisor:'Supervisor', investigator:'Investigator', admin:'Administrator' };
export function WorkersList() {
  const { data: workers, isLoading } = useListWorkers();
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Directory</h1><p className="text-muted-foreground mt-1 text-sm">Manage department personnel.</p></div>
        <Link href="/workers/new"><Button className="gap-2 w-full sm:w-auto"><PlusCircle className="h-4 w-4"/>Add Worker</Button></Link>
      </div>
      <div className="space-y-3 sm:hidden">
        {isLoading?[1,2,3].map(i=><Skeleton key={i} className="h-20 rounded-xl"/>):workers?.map(w=>(
          <Link key={w.id} href={'/workers/'+w.id}>
            <div className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30">
              <div className="flex items-start gap-3">
                <AvatarInitials name={`${w.firstName} ${w.lastName}`} />
                <div className="space-y-1.5"><p className="font-semibold text-primary">{w.firstName} {w.lastName}</p><p className="text-xs text-muted-foreground">{ROLES[w.role]??w.role}</p><p className="text-xs text-muted-foreground">{w.department}</p></div>
              </div>
              <StatusBadge status={w.status}/>
            </div>
          </Link>
        ))}
      </div>
      <Card className="hidden sm:block"><div className="overflow-x-auto">
        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Department</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading?[1,2,3].map(i=><tr key={i} className="border-b">{[1,2,3,4,5,6].map(j=><td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>)}</tr>):workers?.map(w=>(
              <tr key={w.id} className="border-b hover:bg-muted/30 group">
                <td className="px-6 py-4 font-medium text-primary"><Link href={'/workers/'+w.id} className="hover:underline flex items-center gap-2.5"><AvatarInitials name={`${w.firstName} ${w.lastName}`} size="sm" />{w.firstName} {w.lastName}</Link></td>
                <td className="px-6 py-4">{ROLES[w.role]??w.role}</td><td className="px-6 py-4">{w.department}</td>
                <td className="px-6 py-4 text-muted-foreground">{w.email}</td>
                <td className="px-6 py-4"><StatusBadge status={w.status}/></td>
                <td className="px-6 py-4 text-right"><Link href={'/workers/'+w.id}><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></Card>
    </div>
  );
}
