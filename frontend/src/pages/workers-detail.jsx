import { useParams, useLocation } from 'wouter';
import { useGetWorker, useUpdateWorker, useListCases, useListUsers, getGetWorkerQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Save, X, Mail, Phone, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
const ROLES = { social_worker:'Social Worker', supervisor:'Supervisor', investigator:'Investigator', admin:'Administrator' };
export function WorkersDetail() {
  const { id } = useParams(); const numId = Number(id);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const { isAdmin } = useAuth();
  const { data: worker, isLoading } = useGetWorker(numId);
  const { data: allCases } = useListCases();
  const { data: users } = useListUsers({ query: { enabled: isAdmin } });
  const updateWorker = useUpdateWorker();
  const assigned = allCases?.filter(c=>c.workerId===numId)??[];
  const linkAccount = (userId) => updateWorker.mutate(
    { id: numId, data: { userId: userId === 'none' ? null : Number(userId) } },
    { onSuccess: () => qc.invalidateQueries({ queryKey: getGetWorkerQueryKey(numId) }) }
  );
  const startEdit = () => { if(!worker)return; setForm({firstName:worker.firstName,lastName:worker.lastName,email:worker.email,phone:worker.phone??'',role:worker.role,department:worker.department,status:worker.status}); setEditing(true); };
  const saveEdit = () => { updateWorker.mutate({ id:numId, data:form }, { onSuccess:()=>{ qc.invalidateQueries({queryKey:getGetWorkerQueryKey(numId)}); setEditing(false); } }); };
  if(isLoading) return <div className="space-y-6 max-w-3xl mx-auto"><Skeleton className="h-8 w-48"/><Skeleton className="h-64 w-full"/></div>;
  if(!worker) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-muted-foreground">Worker not found.</p><Button variant="outline" className="mt-4" onClick={()=>setLocation('/workers')}>Back</Button></div>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={()=>setLocation('/workers')} className="gap-1"><ArrowLeft className="h-4 w-4"/>Workers</Button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{worker.firstName} {worker.lastName}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2"><span className="text-sm font-medium text-muted-foreground">{ROLES[worker.role]??worker.role}</span><span className="text-muted-foreground">·</span><span className="text-sm text-muted-foreground">{worker.department}</span><StatusBadge status={worker.status}/></div>
        </div>
        {!editing?<Button variant="outline" size="sm" onClick={startEdit} className="gap-2"><Edit2 className="h-4 w-4"/>Edit</Button>:<div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>setEditing(false)} className="gap-1"><X className="h-4 w-4"/>Cancel</Button><Button size="sm" onClick={saveEdit} disabled={updateWorker.isPending} className="gap-1"><Save className="h-4 w-4"/>{updateWorker.isPending?'Saving...':'Save'}</Button></div>}
      </div>
      <Card><CardHeader><CardTitle className="text-base">Contact & Role</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        {editing?(
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">First Name</label><Input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className="mt-1 h-8"/></div>
            <div><label className="text-xs text-muted-foreground">Last Name</label><Input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className="mt-1 h-8"/></div>
            <div><label className="text-xs text-muted-foreground">Email</label><Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="mt-1 h-8"/></div>
            <div><label className="text-xs text-muted-foreground">Phone</label><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="mt-1 h-8"/></div>
            <div><label className="text-xs text-muted-foreground">Department</label><Input value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} className="mt-1 h-8"/></div>
          </div>
        ):(
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/>{worker.email}</div>
            {worker.phone&&<div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{worker.phone}</div>}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div><p className="text-xs text-muted-foreground">Role</p><p className="mt-0.5">{ROLES[worker.role]??worker.role}</p></div>
              <div><p className="text-xs text-muted-foreground">Department</p><p className="mt-0.5">{worker.department}</p></div>
              <div><p className="text-xs text-muted-foreground">Member Since</p><p className="mt-0.5">{format(new Date(worker.createdAt),'MMM d, yyyy')}</p></div>
            </div>
          </div>
        )}
      </CardContent></Card>
      {isAdmin && (
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4"/>Login Account</CardTitle></CardHeader><CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">Link this staff record to a sign-in account so they can log in and see their own assigned cases on their dashboard.</p>
          <Select value={worker.userId ? String(worker.userId) : 'none'} onValueChange={linkAccount} disabled={updateWorker.isPending}>
            <SelectTrigger className="h-9 max-w-xs"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked account</SelectItem>
              {users?.map(u=><SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.email})</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent></Card>
      )}
      <Card><CardHeader><CardTitle className="text-base">Assigned Cases ({assigned.length})</CardTitle></CardHeader><CardContent>
        {assigned.length===0?<p className="text-sm text-muted-foreground py-4 text-center">No cases assigned.</p>:(
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-xs text-muted-foreground uppercase border-b"><th className="py-2 text-left">Case #</th><th className="py-2 text-left">Type</th><th className="py-2 text-left">Priority</th><th className="py-2 text-left">Status</th><th></th></tr></thead>
            <tbody>{assigned.map(c=>(<tr key={c.id} className="border-b last:border-0 hover:bg-muted/30"><td className="py-3 font-medium">{c.caseNumber}</td><td className="py-3 capitalize">{c.abuseType}</td><td className="py-3"><PriorityBadge priority={c.priority}/></td><td className="py-3"><StatusBadge status={c.status}/></td><td className="py-3 text-right"><Link href={'/cases/'+c.id}><Button variant="ghost" size="sm">View</Button></Link></td></tr>))}</tbody>
          </table></div>
        )}
      </CardContent></Card>
    </div>
  );
}
