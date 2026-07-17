import { useState } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import { useResetPassword } from '@/lib/api';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function ResetPassword() {
  const search = useSearch();
  const token = new URLSearchParams(search).get('token') || '';
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const reset = useResetPassword();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    reset.mutate({ token, password }, {
      onSuccess: () => setDone(true),
      onError: (e) => { try { setError(JSON.parse(e.message)?.error || e.message); } catch { setError('This reset link is invalid or has expired.'); } },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Logo className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>Choose something you haven't used before.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <p className="text-sm text-destructive text-center">This link is missing its reset token. Please request a new one from the <Link href="/forgot-password" className="underline">forgot password</Link> page.</p>
          ) : done ? (
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Your password has been reset.</p>
              <Button className="w-full" onClick={() => setLocation('/login')}>Sign In</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" autoComplete="new-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" required
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={reset.isPending}>
                {reset.isPending ? 'Saving...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
