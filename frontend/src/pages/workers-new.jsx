import { useForm } from 'react-hook-form';
import { useCreateWorker } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function WorkersNew() {
  const [, setLocation] = useLocation();
  const createWorker = useCreateWorker();
  const { register, handleSubmit, setValue, formState:{errors} } = useForm({ defaultValues:{firstName:'',lastName:'',email:'',phone:'',role:'social_worker',department:'',status:'active'} });
  const onSubmit = (data) => { createWorker.mutate({ data }, { onSuccess:(res)=>setLocation('/workers/'+res.id) }); };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Staff Member</h1><p className="text-muted-foreground mt-1">Register a new worker.</p></div>
      <Card><CardHeader><CardTitle>Worker Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">First Name *</label><Input {...register('firstName',{required:true})} placeholder="First name"/>{errors.firstName&&<p className="text-xs text-destructive">Required</p>}</div>
            <div className="space-y-2"><label className="text-sm font-medium">Last Name *</label><Input {...register('lastName',{required:true})} placeholder="Last name"/>{errors.lastName&&<p className="text-xs text-destructive">Required</p>}</div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Email *</label><Input {...register('email',{required:true})} type="email" placeholder="worker@org.org"/>{errors.email&&<p className="text-xs text-destructive">Required</p>}</div>
          <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input {...register('phone')} placeholder="555-0100"/></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Role</label><Select onValueChange={v=>setValue('role',v)} defaultValue="social_worker"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="social_worker">Social Worker</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="investigator">Investigator</SelectItem><SelectItem value="admin">Administrator</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select onValueChange={v=>setValue('status',v)} defaultValue="active"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Department *</label><Input {...register('department',{required:true})} placeholder="e.g. Child Protective Services"/>{errors.department&&<p className="text-xs text-destructive">Required</p>}</div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={()=>setLocation('/workers')}>Cancel</Button><Button type="submit" disabled={createWorker.isPending}>{createWorker.isPending?'Saving...':'Add Member'}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
