import { useGetCase, useListCaseNotes, useCreateCaseNote, useDeleteCase, useUpdateCase, useListWorkers, getGetCaseQueryKey, getListCaseNotesQueryKey, getListCasesQueryKey } from '@/lib/api';
import { useParams, useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, CheckCircle2, AlertTriangle, Shield, FileOutput, Lock } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

export function CasesDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { isAdmin, canCloseEscalatedCases } = useAuth();
  const numId = Number(id);
  const [note, setNote] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [referralForm, setReferralForm] = useState({ agency: '', contact: '', referenceNumber: '' });
  const [referralError, setReferralError] = useState('');
  const { data: c, isLoading } = useGetCase(numId);
  const { data: notes } = useListCaseNotes(numId);
  const { data: workers } = useListWorkers();
  const createNote = useCreateCaseNote();
  const deleteCase = useDeleteCase();
  const updateCase = useUpdateCase();

  const invalidate = () => qc.invalidateQueries({ queryKey: getGetCaseQueryKey(numId) });

  const submitNote = () => {
    if (!note.trim()) return;
    createNote.mutate({ id:numId, data:{ content:note, authorName:'Social Worker' } }, { onSuccess:()=>{ setNote(''); qc.invalidateQueries({ queryKey:getListCaseNotesQueryKey(numId) }); } });
  };
  const friendlyError = (e) => {
    try { return JSON.parse(e?.message)?.error || e?.message || 'Something went wrong.'; }
    catch { return e?.message || 'Something went wrong.'; }
  };
  const [statusError, setStatusError] = useState('');
  const changeStatus = (status) => { setStatusError(''); updateCase.mutate({ id:numId, data:{ status } }, { onSuccess: invalidate, onError: (e) => setStatusError(friendlyError(e)) }); };
  const changePriority = (priority) => updateCase.mutate({ id:numId, data:{ priority } }, { onSuccess: invalidate });
  const reassign = (workerId) => updateCase.mutate({ id:numId, data:{ workerId: workerId === 'unassigned' ? null : Number(workerId) } }, { onSuccess: invalidate });

  const markReferred = () => {
    if (!referralForm.agency.trim()) { setReferralError('Agency name is required.'); return; }
    setReferralError('');
    updateCase.mutate(
      { id: numId, data: { referredToLawEnforcement: true, referralAgency: referralForm.agency, referralContact: referralForm.contact, referralReferenceNumber: referralForm.referenceNumber } },
      { onSuccess: invalidate, onError: (e) => setReferralError(friendlyError(e)) }
    );
  };
  const rescindReferral = () => updateCase.mutate(
    { id: numId, data: { referredToLawEnforcement: false } },
    { onSuccess: invalidate }
  );

  const confirmDelete = () => {
    setDeleteError('');
    deleteCase.mutate({ id: numId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCasesQueryKey() });
        setLocation('/cases');
      },
      onError: () => setDeleteError('Could not delete this case. Please try again.'),
    });
  };

  if (isLoading) return <div className="space-y-4 max-w-3xl mx-auto"><Skeleton className="h-8 w-48"/><Skeleton className="h-48 w-full"/></div>;
  if (!c) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-muted-foreground">Case not found.</p><Button variant="outline" className="mt-4" onClick={()=>setLocation('/cases')}>Back</Button></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={()=>setLocation('/cases')} className="gap-1"><ArrowLeft className="h-4 w-4"/>Cases</Button>
        <div className="flex items-center gap-2">
          <a href={`/cases/${numId}/report`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5"><FileOutput className="h-3.5 w-3.5"/>Export Report</Button>
          </a>
          {isAdmin && !confirmingDelete && (
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={()=>setConfirmingDelete(true)}><Trash2 className="h-3.5 w-3.5"/>Delete Case</Button>
          )}
          {isAdmin && confirmingDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this case?</span>
              <Button variant="outline" size="sm" onClick={()=>setConfirmingDelete(false)} disabled={deleteCase.isPending}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={confirmDelete} disabled={deleteCase.isPending}>{deleteCase.isPending?'Deleting...':'Confirm Delete'}</Button>
            </div>
          )}
        </div>
      </div>
      {deleteError && <p className="text-sm text-destructive text-right">{deleteError}</p>}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Case {c.caseNumber}</h1>
        <div className="flex flex-wrap gap-2"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={c.status} onValueChange={changeStatus} disabled={updateCase.isPending}>
                <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="closed" disabled={c.status === 'escalated' && !canCloseEscalatedCases}>
                    Closed{c.status === 'escalated' && !canCloseEscalatedCases ? ' (supervisor/admin only)' : ''}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Priority</label>
              <Select value={c.priority} onValueChange={changePriority} disabled={updateCase.isPending}>
                <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Assigned Worker</label>
              <Select value={c.workerId ? String(c.workerId) : 'unassigned'} onValueChange={reassign} disabled={updateCase.isPending}>
                <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workers?.filter(w=>w.status==='active').map(w=><SelectItem key={w.id} value={String(w.id)}>{w.firstName} {w.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {statusError && <p className="text-sm text-destructive">{statusError}</p>}
          {c.status === 'escalated' && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0"/>
              {canCloseEscalatedCases
                ? "Escalated cases need supervisor or specialist review — reassign to a supervisor if this hasn't happened yet."
                : 'This case is escalated and needs supervisor or admin review before it can be closed.'}
            </div>
          )}
          {c.status === 'closed' && c.closedAt && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0"/>Closed on {format(new Date(c.closedAt),"MMM d, yyyy 'at' h:mm a")}. No further action is expected unless it's reopened.
            </div>
          )}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Case Information</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-sm text-muted-foreground">Abuse Type</p><p className="font-medium capitalize mt-0.5">{c.abuseType.replace(/_/g,' ')}</p></div>
          <div><p className="text-sm text-muted-foreground">Reported</p><p className="font-medium mt-0.5">{format(new Date(c.reportedAt),"MMM d, yyyy 'at' h:mm a")}</p></div>
          {c.child&&<div><p className="text-sm text-muted-foreground">Child</p><Link href={'/children/'+c.childId} className="font-medium text-primary hover:underline mt-0.5 block">{c.child.firstName} {c.child.lastName}</Link></div>}
          {c.worker&&<div><p className="text-sm text-muted-foreground">Assigned Worker</p><Link href={'/workers/'+c.workerId} className="font-medium text-primary hover:underline mt-0.5 block">{c.worker.firstName} {c.worker.lastName}</Link></div>}
          {c.reportId&&<div><p className="text-sm text-muted-foreground">Source Report</p><Link href={'/reports/'+c.reportId} className="font-medium text-primary hover:underline mt-0.5 block">Report #{c.reportId}</Link></div>}
        </div>
        {c.description&&<div className="pt-2 border-t"><p className="text-sm text-muted-foreground">Description</p><p className="mt-1 text-sm leading-relaxed">{c.description}</p></div>}
      </CardContent></Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4"/>Law Enforcement Referral</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5"><Lock className="h-3.5 w-3.5 shrink-0 mt-0.5"/>This is a record only — marking a case as referred does not give the agency access to this system. It just notes that the case was handed off externally, and who to follow up with.</p>
          {c.referredToLawEnforcement ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0"/>Referred to {c.referralAgency}{c.referredAt ? ' on ' + format(new Date(c.referredAt), 'MMM d, yyyy') : ''}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {c.referralContact && <div><p className="text-xs text-muted-foreground">Contact</p><p>{c.referralContact}</p></div>}
                {c.referralReferenceNumber && <div><p className="text-xs text-muted-foreground">Reference Number</p><p className="font-mono">{c.referralReferenceNumber}</p></div>}
              </div>
              {isAdmin && <Button variant="outline" size="sm" onClick={rescindReferral} disabled={updateCase.isPending}>Rescind Referral</Button>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Agency name (e.g. Metro PD)" value={referralForm.agency} onChange={e=>setReferralForm(f=>({...f, agency:e.target.value}))} />
                <Input placeholder="Contact (name/phone/email)" value={referralForm.contact} onChange={e=>setReferralForm(f=>({...f, contact:e.target.value}))} />
                <Input placeholder="Reference number (optional)" value={referralForm.referenceNumber} onChange={e=>setReferralForm(f=>({...f, referenceNumber:e.target.value}))} />
              </div>
              {referralError && <p className="text-sm text-destructive">{referralError}</p>}
              <Button size="sm" variant="outline" onClick={markReferred} disabled={updateCase.isPending}>{updateCase.isPending ? 'Saving...' : 'Mark as Referred'}</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Case Notes</CardTitle></CardHeader><CardContent className="space-y-4">
        {notes?.length>0?(
          <div className="space-y-3">{notes.map(n=>(
            <div key={n.id} className="border-l-2 border-primary/30 pl-4 py-1">
              <p className="text-sm">{n.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.authorName} · {format(new Date(n.createdAt),"MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          ))}</div>
        ):<p className="text-sm text-muted-foreground py-2">No notes yet.</p>}
        <div className="pt-2 border-t space-y-2">
          <Textarea placeholder="Add a case note..." value={note} onChange={e=>setNote(e.target.value)} rows={3}/>
          <div className="flex justify-end"><Button size="sm" onClick={submitNote} disabled={!note.trim()||createNote.isPending}>{createNote.isPending?'Saving...':'Add Note'}</Button></div>
        </div>
      </CardContent></Card>
    </div>
  );
}
