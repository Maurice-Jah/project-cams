import { useForm } from 'react-hook-form';
import { useCreateCase, useListChildren, useListWorkers, useUpdateReport } from '@/lib/api';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CasesNew() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const reportId = params.get('reportId');

  const createCase = useCreateCase();
  const updateReport = useUpdateReport();
  const { data: children } = useListChildren();
  const { data: workers } = useListWorkers();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      status: 'open',
      priority: 'medium',
      abuseType: params.get('abuseType') || 'physical',
      description: params.get('description') || '',
      childId: '',
      workerId: '',
      reportId: reportId || '',
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      childId: data.childId ? Number(data.childId) : undefined,
      workerId: data.workerId ? Number(data.workerId) : undefined,
      reportId: data.reportId ? Number(data.reportId) : undefined,
    };
    createCase.mutate({ data: payload }, {
      onSuccess: (res) => {
        // Mark the source report as escalated so it's clear it has been
        // acted on and turned into a case (see Reports > "Convert to Case").
        if (reportId) {
          updateReport.mutate({ id: Number(reportId), data: { status: 'escalated' } });
        }
        setLocation('/cases/' + res.id);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Case</h1>
        {reportId && <p className="text-sm text-muted-foreground mt-1">Creating this case from Report #{reportId} — details prefilled below.</p>}
      </div>
      <Card><CardHeader><CardTitle>Case Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select onValueChange={v=>setValue('status',v)} defaultValue="open"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="under_investigation">Under Investigation</SelectItem><SelectItem value="escalated">Escalated</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Priority</label><Select onValueChange={v=>setValue('priority',v)} defaultValue="medium"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Abuse Type</label><Select onValueChange={v=>setValue('abuseType',v)} defaultValue={watch('abuseType')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="physical">Physical</SelectItem><SelectItem value="emotional">Emotional</SelectItem><SelectItem value="sexual">Sexual</SelectItem><SelectItem value="neglect">Neglect</SelectItem><SelectItem value="financial">Financial</SelectItem></SelectContent></Select></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Child (optional)</label>
              <Select onValueChange={v=>setValue('childId',v)}><SelectTrigger><SelectValue placeholder="Link a child record..."/></SelectTrigger><SelectContent>{children?.map(c=><SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent></Select>
              <p className="text-xs text-muted-foreground">Not listed? <a href="/children/new" className="text-primary hover:underline">Add a child record</a> first.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Worker (optional)</label>
              <Select onValueChange={v=>setValue('workerId',v)}><SelectTrigger><SelectValue placeholder="Assign later..."/></SelectTrigger><SelectContent>{workers?.filter(w=>w.status==='active').map(w=><SelectItem key={w.id} value={String(w.id)}>{w.firstName} {w.lastName} — {w.role.replace(/_/g,' ')}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea {...register('description')} rows={4} placeholder="Initial case details..."/></div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={()=>setLocation('/cases')}>Cancel</Button>
            <Button type="submit" disabled={createCase.isPending}>{createCase.isPending?'Creating...':'Create Case'}</Button>
          </div>
        </form>
      </CardContent></Card>
    </div>
  );
}
