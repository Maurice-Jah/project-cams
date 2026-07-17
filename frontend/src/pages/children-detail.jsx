import { useParams, useLocation } from 'wouter';
import { useGetChild, useUpdateChild, useListCases, getGetChildQueryKey } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
export function ChildrenDetail() {
  const { id } = useParams(); const numId = Number(id);
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const { data: child, isLoading } = useGetChild(numId);
  const { data: allCases } = useListCases();
  const updateChild = useUpdateChild();
  const linked = allCases?.filter(c=>c.childId===numId)??[];
  const startEdit = () => { if(!child)return; setForm({firstName:child.firstName,lastName:child.lastName,dateOfBirth:child.dateOfBirth,gender:child.gender,status:child.status,address:child.address??'',guardianName:child.guardianName??'',guardianPhone:child.guardianPhone??'',schoolName:child.schoolName??'',notes:child.notes??''}); setEditing(true); };
  const saveEdit = () => { updateChild.mutate({ id:numId, data:form }, { onSuccess:()=>{ qc.invalidateQueries({queryKey:getGetChildQueryKey(numId)}); setEditing(false); } }); };
  if(isLoading) return <div className="space-y-6 max-w-3xl mx-auto"><Skeleton className="h-8 w-48"/><Skeleton className="h-64 w-full"/></div>;
  if(!child) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-muted-foreground">Child not found.</p><Button variant="outline" className="mt-4" onClick={()=>setLocation('/children')}>Back</Button></div>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={()=>setLocation('/children')} className="gap-1"><ArrowLeft className="h-4 w-4"/>Children</Button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{child.firstName} {child.lastName}</h1><div className="flex items-center gap-2 mt-2"><StatusBadge status={child.status}/><span className="text-muted-foreground text-sm capitalize">{child.gender}</span></div></div>
        {!editing?<Button variant="outline" size="sm" onClick={startEdit} className="gap-2"><Edit2 className="h-4 w-4"/>Edit</Button>:<div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>setEditing(false)} className="gap-1"><X className="h-4 w-4"/>Cancel</Button><Button size="sm" onClick={saveEdit} disabled={updateChild.isPending} className="gap-1"><Save className="h-4 w-4"/>{updateChild.isPending?'Saving...':'Save'}</Button></div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          {editing?(
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-muted-foreground">First Name</label><Input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className="mt-1 h-8"/></div><div><label className="text-xs text-muted-foreground">Last Name</label><Input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className="mt-1 h-8"/></div></div>
              <div><label className="text-xs text-muted-foreground">Date of Birth</label><Input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} className="mt-1 h-8"/></div>
              <div><label className="text-xs text-muted-foreground">Address</label><Input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className="mt-1 h-8"/></div>
              <div><label className="text-xs text-muted-foreground">School</label><Input value={form.schoolName} onChange={e=>setForm(f=>({...f,schoolName:e.target.value}))} className="mt-1 h-8"/></div>
            </div>
          ):(
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span>{format(new Date(child.dateOfBirth),'MMMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="capitalize">{child.gender}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{child.address||'—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">School</span><span>{child.schoolName||'—'}</span></div>
            </div>
          )}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Guardian</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          {editing?(
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Guardian Name</label><Input value={form.guardianName} onChange={e=>setForm(f=>({...f,guardianName:e.target.value}))} className="mt-1 h-8"/></div>
              <div><label className="text-xs text-muted-foreground">Guardian Phone</label><Input value={form.guardianPhone} onChange={e=>setForm(f=>({...f,guardianPhone:e.target.value}))} className="mt-1 h-8"/></div>
            </div>
          ):(
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{child.guardianName||'—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{child.guardianPhone||'—'}</span></div>
              {child.notes&&<div className="pt-2 border-t"><p className="text-xs text-muted-foreground mb-1">Notes</p><p>{child.notes}</p></div>}
            </div>
          )}
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Linked Cases ({linked.length})</CardTitle></CardHeader><CardContent>
        {linked.length===0?<p className="text-sm text-muted-foreground py-4 text-center">No cases linked.</p>:(
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-xs text-muted-foreground uppercase border-b"><th className="py-2 text-left">Case #</th><th className="py-2 text-left">Type</th><th className="py-2 text-left">Priority</th><th className="py-2 text-left">Status</th><th></th></tr></thead>
            <tbody>{linked.map(c=>(<tr key={c.id} className="border-b last:border-0 hover:bg-muted/30"><td className="py-3 font-medium">{c.caseNumber}</td><td className="py-3 capitalize">{c.abuseType}</td><td className="py-3"><PriorityBadge priority={c.priority}/></td><td className="py-3"><StatusBadge status={c.status}/></td><td className="py-3 text-right"><Link href={'/cases/'+c.id}><Button variant="ghost" size="sm">View</Button></Link></td></tr>))}</tbody>
          </table></div>
        )}
      </CardContent></Card>
    </div>
  );
}
