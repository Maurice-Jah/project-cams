import { useForm } from 'react-hook-form';
import { useCreateInvestigation, useListCases, useListWorkers } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
export function InvestigationsNew() {
  const [, setLocation] = useLocation();
  const [submitError, setSubmitError] = useState('');
  const createInv = useCreateInvestigation();
  const { data: cases } = useListCases();
  const { data: workers } = useListWorkers();
  const investigators = workers?.filter(w => w.role === 'investigator' && w.status === 'active') ?? [];
  const { register, handleSubmit, setValue, formState:{errors} } = useForm({ defaultValues:{caseId:'',workerId:'',status:'open',startedAt:new Date().toISOString().split('T')[0],findings:''} });
  const onSubmit = (data) => {
    setSubmitError('');
    const payload={...data,caseId:Number(data.caseId),workerId:data.workerId?Number(data.workerId):undefined};
    createInv.mutate({ data:payload }, {
      onSuccess:(res)=>setLocation('/investigations/'+res.id),
      onError:(e)=>{ try { setSubmitError(JSON.parse(e.message)?.error || e.message); } catch { setSubmitError(e.message || 'Could not start investigation.'); } },
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Start Investigation</h1><p className="text-muted-foreground mt-1">Open a new investigation for a case.</p></div>
      <Card><CardHeader><CardTitle>Investigation Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Linked Case *</label>
            <Select onValueChange={v=>setValue('caseId',v)}><SelectTrigger><SelectValue placeholder="Select a case..."/></SelectTrigger><SelectContent>{cases?.map(c=><SelectItem key={c.id} value={String(c.id)}>{c.caseNumber} — {c.abuseType}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Investigator</label>
            <Select onValueChange={v=>setValue('workerId',v)}><SelectTrigger><SelectValue placeholder="Select investigator..."/></SelectTrigger><SelectContent>{investigators.map(w=><SelectItem key={w.id} value={String(w.id)}>{w.firstName} {w.lastName}</SelectItem>)}</SelectContent></Select>
            <p className="text-xs text-muted-foreground">Only workers whose staff role is "Investigator" can be assigned here — set that on the worker's profile if someone's missing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select onValueChange={v=>setValue('status',v)} defaultValue="open"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Start Date *</label><Input {...register('startedAt',{required:true})} type="date"/></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Initial Findings</label><Textarea {...register('findings')} rows={4} placeholder="Initial observations..."/></div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={()=>setLocation('/investigations')}>Cancel</Button><Button type="submit" disabled={createInv.isPending}>{createInv.isPending?'Opening...':'Open Investigation'}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
