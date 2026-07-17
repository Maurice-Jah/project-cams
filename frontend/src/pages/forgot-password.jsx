import { useState } from 'react';
import { Link } from 'wouter';
import { useForgotPassword } from '@/lib/api';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, MailCheck } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();

  const onSubmit = (e) => {
    e.preventDefault();
    // We always show the same confirmation regardless of the API result —
    // the backend responds identically whether or not the email exists, so
    // this page never reveals which emails have accounts either.
    forgot.mutate({ email }, { onSettled: () => setSent(true) });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Logo className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>We'll email you a link to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <MailCheck className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset link is on its way. It expires in 30 minutes.</p>
              <Link href="/login"><Button variant="outline" className="w-full gap-2"><ArrowLeft className="h-4 w-4"/>Back to sign in</Button></Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="username" required
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@org.org" />
              </div>
              <Button type="submit" className="w-full" disabled={forgot.isPending}>
                {forgot.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link href="/login"><Button type="button" variant="ghost" className="w-full gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Back to sign in</Button></Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
