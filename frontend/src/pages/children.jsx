import { useListChildren } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/badges';
import { AvatarInitials } from '@/components/avatar-initials';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
export function ChildrenList() {
  const { data: children, isLoading } = useListChildren();
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Children Directory</h1><p className="text-muted-foreground mt-1 text-sm">Manage child profiles and linked cases.</p></div>
        <Link href="/children/new"><Button className="gap-2 w-full sm:w-auto"><PlusCircle className="h-4 w-4"/>Add Child</Button></Link>
      </div>
      <div className="space-y-3 sm:hidden">
        {isLoading?[1,2,3].map(i=><Skeleton key={i} className="h-24 rounded-xl"/>):children?.map(c=>(
          <Link key={c.id} href={'/children/'+c.id}>
            <div className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/30">
              <div className="flex items-start gap-3">
                <AvatarInitials name={`${c.firstName} ${c.lastName}`} />
                <div className="space-y-1.5"><p className="font-semibold text-primary">{c.firstName} {c.lastName}</p><p className="text-xs text-muted-foreground">{format(new Date(c.dateOfBirth),'MMM d, yyyy')}</p><p className="text-xs text-muted-foreground">{c.guardianName||'No guardian'}</p></div>
              </div>
              <div className="flex flex-col items-end gap-1.5"><StatusBadge status={c.status}/><p className="text-xs text-muted-foreground capitalize">{c.gender}</p></div>
            </div>
          </Link>
        ))}
      </div>
      <Card className="hidden sm:block"><div className="overflow-x-auto">
        <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">DOB</th><th className="px-6 py-4">Gender</th><th className="px-6 py-4">Guardian</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading?[1,2,3].map(i=><tr key={i} className="border-b">{[1,2,3,4,5,6].map(j=><td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>)}</tr>):children?.map(c=>(
              <tr key={c.id} className="border-b hover:bg-muted/30 group">
                <td className="px-6 py-4 font-medium text-primary"><Link href={'/children/'+c.id} className="hover:underline flex items-center gap-2.5"><AvatarInitials name={`${c.firstName} ${c.lastName}`} size="sm" />{c.firstName} {c.lastName}</Link></td>
                <td className="px-6 py-4 text-muted-foreground">{format(new Date(c.dateOfBirth),'MMM d, yyyy')}</td>
                <td className="px-6 py-4 capitalize">{c.gender}</td>
                <td className="px-6 py-4">{c.guardianName||'—'}</td>
                <td className="px-6 py-4"><StatusBadge status={c.status}/></td>
                <td className="px-6 py-4 text-right"><Link href={'/children/'+c.id}><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></Card>
    </div>
  );
}
