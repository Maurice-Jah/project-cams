import { useForm } from 'react-hook-form';
import { useCreateReport } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function ReportsNew() {
  const [, setLocation] = useLocation();
  const createReport = useCreateReport();
  const { register, handleSubmit, setValue, formState:{errors} } = useForm({ defaultValues:{reporterName:'',reporterType:'anonymous',reporterPhone:'',reporterEmail:'',abuseType:'physical',description:'',childFirstName:'',childLastName:'',childAge:'',incidentLocation:'',incidentDate:'',status:'new'} });
  const onSubmit = (data) => { const payload={...data,childAge:data.childAge?Number(data.childAge):undefined}; createReport.mutate({ data:payload }, { onSuccess:(res)=>setLocation('/reports/'+res.id) }); };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">File Abuse Report</h1><p className="text-muted-foreground mt-1">Record a new incoming report.</p></div>
      <Card><CardHeader><CardTitle>Report Details</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Reporter Name *</label><Input {...register('reporterName',{required:true})} placeholder="Name or Anonymous"/>{errors.reporterName&&<p className="text-xs text-destructive">Required</p>}</div>
            <div className="space-y-2"><label className="text-sm font-medium">Reporter Type</label><Select onValueChange={v=>setValue('reporterType',v)} defaultValue="anonymous"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="anonymous">Anonymous</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="community">Community</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input {...register('reporterPhone')} placeholder="555-0100"/></div>
            <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input {...register('reporterEmail')} type="email" placeholder="reporter@example.com"/></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Abuse Type *</label><Select onValueChange={v=>setValue('abuseType',v)} defaultValue="physical"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="physical">Physical</SelectItem><SelectItem value="emotional">Emotional</SelectItem><SelectItem value="sexual">Sexual</SelectItem><SelectItem value="neglect">Neglect</SelectItem><SelectItem value="financial">Financial</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><label className="text-sm font-medium">Description *</label><Textarea {...register('description',{required:true})} rows={4} placeholder="Describe what was reported..."/>{errors.description&&<p className="text-xs text-destructive">Required</p>}</div>
          <div className="border-t pt-4 space-y-4"><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Child Information (if known)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">First Name</label><Input {...register('childFirstName')} placeholder="First name"/></div>
              <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><Input {...register('childLastName')} placeholder="Last name"/></div>
              <div className="space-y-2"><label className="text-sm font-medium">Age</label><Input {...register('childAge')} type="number" min="0" max="17"/></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Incident Location</label><Input {...register('incidentLocation')}/></div>
              <div className="space-y-2"><label className="text-sm font-medium">Incident Date</label><Input {...register('incidentDate')} type="date"/></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={()=>setLocation('/reports')}>Cancel</Button><Button type="submit" disabled={createReport.isPending}>{createReport.isPending?'Submitting...':'Submit Report'}</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
