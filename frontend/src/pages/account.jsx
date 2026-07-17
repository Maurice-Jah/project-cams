import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useChangePassword } from '@/lib/api';
import { AvatarInitials } from '@/components/avatar-initials';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export function Account() {
  const { user, isAdmin, workerRole } = useAuth();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirm) { setError('New passwords do not match.'); return; }
    changePassword.mutate({ currentPassword, newPassword }, {
      onSuccess: () => { setSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirm(''); },
      onError: (e) => { try { setError(JSON.parse(e.message)?.error || e.message); } catch { setError('Could not update your password.'); } },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your login details and password.</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <AvatarInitials name={user?.name} size="lg" />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {isAdmin ? 'Administrator' : 'Staff'}{workerRole ? ` · Staff role: ${workerRole.replace(/_/g,' ')}` : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4"/>Change Password</CardTitle><CardDescription>You'll need your current password to set a new one.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" autoComplete="current-password" required
                value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" autoComplete="new-password" required
                value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" required
                value={confirm} onChange={e=>setConfirm(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4"/>Password updated.</p>}
            <Button type="submit" disabled={changePassword.isPending}>{changePassword.isPending ? 'Saving...' : 'Update Password'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
