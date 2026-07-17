import { useParams, useLocation, Link } from 'wouter';
import { useGetReport, useUpdateReport, getGetReportQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, FolderPlus } from 'lucide-react';
const RT = { anonymous:'Anonymous', professional:'Professional (Mandated)', family:'Family Member', community:'Community' };
export function ReportsDetail() {
  const { id } = useParams(); const numId = Number(id);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: r, isLoading } = useGetReport(numId);
  const updateReport = useUpdateReport();
  const changeStatus = (status) => { updateReport.mutate({ id:numId, data:{status} }, { onSuccess:()=>qc.invalidateQueries({queryKey:getGetReportQueryKey(numId)}) }); };
  if(isLoading) return <div className="space-y-6 max-w-3xl mx-auto"><Skeleton className="h-8 w-48"/><Skeleton className="h-64 w-full"/></div>;
  if(!r) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-muted-foreground">Report not found.</p><Button variant="outline" className="mt-4" onClick={()=>setLocation('/reports')}>Back</Button></div>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={()=>setLocation('/reports')} className="gap-1"><ArrowLeft className="h-4 w-4"/>Reports</Button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Report #{r.id}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2"><StatusBadge status={r.status}/><span className="text-muted-foreground text-sm capitalize">{r.abuseType} abuse</span><span className="text-muted-foreground text-sm">· {format(new Date(r.reportedAt),'MMM d, yyyy')}</span></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Update status:</span>
          <Select value={r.status} onValueChange={changeStatus} disabled={updateReport.isPending}><SelectTrigger className="w-36 h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="reviewed">Reviewed</SelectItem><SelectItem value="escalated">Escalated</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
          {r.status !== 'closed' && (
            <Link href={`/cases/new?reportId=${r.id}&abuseType=${encodeURIComponent(r.abuseType)}&description=${encodeURIComponent('Filed from report #'+r.id+' by '+r.reporterName+': '+r.description)}`}>
              <Button size="sm" variant="outline" className="gap-1.5"><FolderPlus className="h-3.5 w-3.5"/>Convert to Case</Button>
            </Link>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-3">A report is the intake record of what was reported to you. Converting it opens a formal case for investigation and keeps a link back to this report.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Reporter</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{r.reporterName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{RT[r.reporterType]??r.reporterType}</span></div>
          {r.reporterPhone&&<div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{r.reporterPhone}</span></div>}
          {r.reporterEmail&&<div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{r.reporterEmail}</span></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Child Information</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{[r.childFirstName,r.childLastName].filter(Boolean).join(' ')||'Unknown'}</span></div>
          {r.childAge!=null&&<div className="flex justify-between"><span className="text-muted-foreground">Age</span><span>{r.childAge} years old</span></div>}
          {r.incidentLocation&&<div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{r.incidentLocation}</span></div>}
          {r.incidentDate&&<div className="flex justify-between"><span className="text-muted-foreground">Incident Date</span><span>{format(new Date(r.incidentDate),'MMM d, yyyy')}</span></div>}
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{r.description}</p></CardContent></Card>
    </div>
  );
}
