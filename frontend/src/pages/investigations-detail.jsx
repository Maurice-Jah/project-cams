import { useParams, useLocation } from 'wouter';
import { useGetInvestigation, useUpdateInvestigation, useListWorkers, getGetInvestigationQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
export function InvestigationsDetail() {
  const { id } = useParams(); const numId = Number(id);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saveError, setSaveError] = useState('');
  const { data: inv, isLoading } = useGetInvestigation(numId);
  const { data: workers } = useListWorkers();
  const updateInv = useUpdateInvestigation();
  const investigators = workers?.filter(w => w.role === 'investigator' && w.status === 'active') ?? [];
  const assignedWorker = workers?.find(w => w.id === inv?.workerId);
  const startEdit = () => { if(!inv)return; setForm({status:inv.status,startedAt:inv.startedAt,completedAt:inv.completedAt??'',findings:inv.findings,outcome:inv.outcome??'',workerId:inv.workerId?String(inv.workerId):'unassigned'}); setSaveError(''); setEditing(true); };
  const saveEdit = () => {
    const p={...form};
    if(!p.completedAt)delete p.completedAt;
    if(!p.outcome)delete p.outcome;
    p.workerId = p.workerId === 'unassigned' ? null : Number(p.workerId);
    updateInv.mutate({ id:numId, data:p }, {
      onSuccess:()=>{ qc.invalidateQueries({queryKey:getGetInvestigationQueryKey(numId)}); setEditing(false); },
      onError:(e)=>{ try { setSaveError(JSON.parse(e.message)?.error || e.message); } catch { setSaveError(e.message || 'Could not save changes.'); } },
    });
  };
  if(isLoading) return <div className="space-y-6 max-w-3xl mx-auto"><Skeleton className="h-8 w-48"/><Skeleton className="h-64 w-full"/></div>;
  if(!inv) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-muted-foreground">Investigation not found.</p><Button variant="outline" className="mt-4" onClick={()=>setLocation('/investigations')}>Back</Button></div>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={()=>setLocation('/investigations')} className="gap-1"><ArrowLeft className="h-4 w-4"/>Investigations</Button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investigation #{inv.id}</h1>
          <div className="flex items-center gap-2 mt-2"><StatusBadge status={inv.status}/><span className="text-muted-foreground text-sm">· Case <Link href={'/cases/'+inv.caseId} className="text-primary hover:underline">#{inv.caseId}</Link></span></div>
        </div>
        {!editing?<Button variant="outline" size="sm" onClick={startEdit} className="gap-2"><Edit2 className="h-4 w-4"/>Edit</Button>:<div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>setEditing(false)} className="gap-1"><X className="h-4 w-4"/>Cancel</Button><Button size="sm" onClick={saveEdit} disabled={updateInv.isPending} className="gap-1"><Save className="h-4 w-4"/>{updateInv.isPending?'Saving...':'Save'}</Button></div>}
      </div>
      <Card><CardHeader><CardTitle className="text-base">Record</CardTitle></CardHeader><CardContent className="space-y-4">
        {editing?(
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground">Status</label><Select value={form.status} onValueChange={v=>setForm(f=>({...f,status:v}))}><SelectTrigger className="mt-1 h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="inconclusive">Inconclusive</SelectItem></SelectContent></Select></div>
              <div><label className="text-xs text-muted-foreground">Outcome</label><Select value={form.outcome} onValueChange={v=>setForm(f=>({...f,outcome:v}))}><SelectTrigger className="mt-1 h-8"><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="substantiated">Substantiated</SelectItem><SelectItem value="unsubstantiated">Unsubstantiated</SelectItem><SelectItem value="inconclusive">Inconclusive</SelectItem></SelectContent></Select></div>
              <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" value={form.startedAt} onChange={e=>setForm(f=>({...f,startedAt:e.target.value}))} className="mt-1 h-8"/></div>
              <div><label className="text-xs text-muted-foreground">Completed Date</label><Input type="date" value={form.completedAt} onChange={e=>setForm(f=>({...f,completedAt:e.target.value}))} className="mt-1 h-8"/></div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Investigator</label>
                <Select value={form.workerId} onValueChange={v=>setForm(f=>({...f,workerId:v}))}><SelectTrigger className="mt-1 h-8"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{investigators.map(w=><SelectItem key={w.id} value={String(w.id)}>{w.firstName} {w.lastName}</SelectItem>)}</SelectContent></Select>
                <p className="text-xs text-muted-foreground mt-1">Only workers tagged "Investigator" on their profile appear here.</p>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">Findings</label><Textarea value={form.findings} onChange={e=>setForm(f=>({...f,findings:e.target.value}))} rows={6} className="mt-1"/></div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          </>
        ):(
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Status</p><div className="mt-0.5"><StatusBadge status={inv.status}/></div></div>
              <div><p className="text-xs text-muted-foreground">Outcome</p><p className="mt-0.5 capitalize">{inv.outcome||'Pending'}</p></div>
              <div><p className="text-xs text-muted-foreground">Started</p><p className="mt-0.5">{format(new Date(inv.startedAt),'MMM d, yyyy')}</p></div>
              <div><p className="text-xs text-muted-foreground">Completed</p><p className="mt-0.5">{inv.completedAt?format(new Date(inv.completedAt),'MMM d, yyyy'):'Ongoing'}</p></div>
              <div><p className="text-xs text-muted-foreground">Investigator</p><p className="mt-0.5">{assignedWorker ? <Link href={'/workers/'+assignedWorker.id} className="text-primary hover:underline">{assignedWorker.firstName} {assignedWorker.lastName}</Link> : 'Unassigned'}</p></div>
            </div>
            {inv.findings&&<div className="pt-2 border-t"><p className="text-xs text-muted-foreground mb-2">Findings</p><p className="text-sm leading-relaxed whitespace-pre-wrap">{inv.findings}</p></div>}
          </>
        )}
      </CardContent></Card>
    </div>
  );
}
