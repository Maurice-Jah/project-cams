import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, ShieldCheck, KeyRound } from 'lucide-react';
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, useListWorkers, useSendResetLink, getListUsersQueryKey } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AvatarInitials } from '@/components/avatar-initials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function UsersList() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const { data: users, isLoading } = useListUsers();
  const { data: workers } = useListWorkers();
  const workerFor = (userId) => workers?.find(w => w.userId === userId);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const sendResetLink = useSendResetLink();
  const [formError, setFormError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [resetSentId, setResetSentId] = useState(null);

  const resetLink = (u) => {
    sendResetLink.mutate({ id: u.id }, { onSuccess: () => { setResetSentId(u.id); setTimeout(() => setResetSentId(null), 4000); } });
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '', role: 'staff' },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const onSubmit = (data) => {
    setFormError('');
    createUser.mutate({ data }, {
      onSuccess: () => { reset({ name: '', email: '', password: '', role: 'staff' }); refresh(); },
      onError: () => setFormError('Could not create that account. Email may already be in use, or the password is too short (min 8 characters).'),
    });
  };

  const toggleStatus = (u) => {
    updateUser.mutate({ id: u.id, data: { status: u.status === 'active' ? 'inactive' : 'active' } }, { onSuccess: refresh });
  };

  const removeUser = (id) => {
    deleteUser.mutate({ id }, { onSuccess: () => { setConfirmingId(null); refresh(); } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users &amp; Access</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage who can sign in and their role. Administrators have full permissions, including deleting cases.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4"/>Add a login account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5 lg:col-span-1">
              <Label>Name</Label>
              <Input {...register('name', { required: true })} placeholder="Full name" />
              {errors.name && <p className="text-xs text-destructive">Required</p>}
            </div>
            <div className="space-y-1.5 lg:col-span-1">
              <Label>Email</Label>
              <Input type="email" {...register('email', { required: true })} placeholder="name@org.org" />
              {errors.email && <p className="text-xs text-destructive">Required</p>}
            </div>
            <div className="space-y-1.5 lg:col-span-1">
              <Label>Password</Label>
              <Input type="password" {...register('password', { required: true, minLength: 8 })} placeholder="Min 8 characters" />
              {errors.password && <p className="text-xs text-destructive">Min 8 characters</p>}
            </div>
            <div className="space-y-1.5 lg:col-span-1">
              <Label>Role</Label>
              <Select value={watch('role')} onValueChange={(v) => setValue('role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={createUser.isPending} className="lg:col-span-1">
              {createUser.isPending ? 'Adding...' : 'Add Account'}
            </Button>
          </form>
          {formError && <p className="text-sm text-destructive mt-3">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Linked Staff Record</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1, 2, 3].map(i => (
                <tr key={i} className="border-b">{[1, 2, 3, 4, 5, 6].map(j => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>)}</tr>
              )) : users?.map(u => (
                <tr key={u.id} className="border-b hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={u.name} size="sm" />
                      <span>{u.name} {u.id === me?.id && <span className="text-xs text-muted-foreground font-normal">(you)</span>}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin'
                      ? <Badge variant="outline" className="gap-1 bg-blue-100 text-blue-800 border-blue-200"><ShieldCheck className="h-3 w-3"/>Administrator</Badge>
                      : <Badge variant="outline">Staff</Badge>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {workerFor(u.id) ? `${workerFor(u.id).firstName} ${workerFor(u.id).lastName}` : <span className="italic">Not linked — set from that worker's profile</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={u.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>{u.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {resetSentId === u.id ? (
                      <span className="text-xs text-emerald-700 font-medium">Reset link sent</span>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => resetLink(u)} disabled={sendResetLink.isPending}>
                        <KeyRound className="h-3.5 w-3.5"/>Send Reset Link
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(u)} disabled={updateUser.isPending}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    {u.id !== me?.id && (
                      confirmingId === u.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setConfirmingId(null)}>Cancel</Button>
                          <Button variant="destructive" size="sm" onClick={() => removeUser(u.id)} disabled={deleteUser.isPending}>Confirm</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={() => setConfirmingId(u.id)}>
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && users?.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
