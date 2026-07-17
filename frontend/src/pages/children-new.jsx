import { useForm } from 'react-hook-form';
import { useCreateChild } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function ChildrenNew() {
  const [, setLocation] = useLocation();
  const createChild = useCreateChild();
  const { register, handleSubmit, setValue, formState:{errors} } = useForm({ defaultValues:{firstName:'',lastName:'',dateOfBirth:'',gender:'male',status:'active',address:'',guardianName:'',guardianPhone:'',schoolName:'',notes:''} });
  const onSubmit = (data) => { createChild.mutate({ data }, { onSuccess:(res)=>setLocation('/children/'+res.id) }); };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Child Record</h1><p className="text-muted-foreground mt-1">Create a new child profile.</p></div>
      <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">First Name *</label><Input {...register('firstName',{required:true})} placeholder="First name"/>{errors.firstName&&<p className="text-xs text-destructive">Required</p>}</div>
            <div className="space-y-2"><label className="text-sm font-medium">Last Name *</label><Input {...register('lastName',{required:true})} placeholder="Last name"/>{errors.lastName&&<p className="text-xs text-destructive">Required</p>}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Date of Birth *</label><Input {...register('dateOfBirth',{required:true})} type="date"/></div>
            <div className="space-y-2"><label className="text-sm font-medium">Gender *</label><Select onValueChange={v=>setValue('gender',v)} defaultValue="male"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select onValueChange={v=>setValue('status',v)} defaultValue="active"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem><SelectItem value="referred">Referred</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><label className="text-sm font-medium">Address</label><Input {...register('address')} placeholder="Street address"/></div>
          <div className="border-t pt-4 space-y-3"><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Guardian Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Guardian Name</label><Input {...register('guardianName')} placeholder="Full name"/></div>
              <div className="space-y-2"><label className="text-sm font-medium">Guardian Phone</label><Input {...register('guardianPhone')} placeholder="Phone number"/></div>
            </div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">School Name</label><Input {...register('schoolName')} placeholder="School name"/></div>
          <div className="space-y-2"><label className="text-sm font-medium">Notes</label><Textarea {...register('notes')} rows={3} placeholder="Any relevant notes..."/></div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={()=>setLocation('/children')}>Cancel</Button><Button type="submit" disabled={createChild.isPending}>{createChild.isPending?'Saving...':'Save Record'}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
