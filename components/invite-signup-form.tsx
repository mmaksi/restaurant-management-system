'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getSession,
  setSession,
  exchangeCodeForSession,
  verifyOtp,
  updateUserPassword,
} from '@/infra/auth/helpers/client';

export function InviteSignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Extract token from URL hash fragment or query parameters
    const handleTokenFromUrl = async () => {
      try {
        // First, check if we already have a valid session
        const {
          data: { session: existingSession },
        } = await getSession();

        if (existingSession) {
          // Session already exists, we're good to go
          setSessionReady(true);
          setIsVerifying(false);
          return;
        }

        // Try to get tokens from hash fragment (Supabase sometimes uses this)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // If no hash tokens, try query parameters
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const tokenHash = searchParams.get('token_hash');
        const queryType = searchParams.get('type');

        // Handle hash fragment tokens
        if (accessToken && type === 'invite') {
          const { data: sessionData, error: sessionError } = await setSession(
            accessToken,
            refreshToken || ''
          );

          if (sessionError) {
            throw new Error(
              sessionError.message || 'Invalid or expired invitation link'
            );
          }

          if (!sessionData.session) {
            throw new Error('Failed to create session from invitation link');
          }

          // Clear the hash from URL for cleaner UX
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );

          setSessionReady(true);
          setIsVerifying(false);
          return;
        }

        // Handle query parameter code (OAuth-style)
        if (code) {
          const { data: sessionData, error: sessionError } =
            await exchangeCodeForSession(code);

          if (sessionError) {
            throw new Error(
              sessionError.message || 'Invalid or expired invitation link'
            );
          }

          if (!sessionData.session) {
            throw new Error('Failed to create session from invitation code');
          }

          setSessionReady(true);
          setIsVerifying(false);
          return;
        }

        // Handle token_hash (OTP-style)
        if (tokenHash && queryType === 'invite') {
          const { error: verifyError } = await verifyOtp('invite', tokenHash);

          if (verifyError) {
            throw new Error(
              verifyError.message || 'Invalid or expired invitation link'
            );
          }

          // After verifyOtp, check for session
          const {
            data: { session },
          } = await getSession();
          if (!session) {
            throw new Error(
              'Failed to create session after verifying invitation'
            );
          }

          setSessionReady(true);
          setIsVerifying(false);
          return;
        }

        // No valid tokens found
        setError('Invalid or missing invitation link');
        setIsVerifying(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to verify invitation'
        );
        setIsVerifying(false);
      }
    };

    handleTokenFromUrl();
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 1) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      // Verify we have a valid session before updating password
      const {
        data: { session },
        error: sessionError,
      } = await getSession();

      if (sessionError || !session) {
        // Try to restore session from URL if it's missing
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const { error: setSessionError } = await setSession(
            accessToken,
            refreshToken || ''
          );

          if (setSessionError) {
            throw new Error(
              'Session expired. Please use a fresh invitation link.'
            );
          }
        } else {
          throw new Error(
            'Session expired. Please use a fresh invitation link.'
          );
        }
      }

      // Update the user's password
      const { data: userData, error: updateError } = await updateUserPassword(
        password
      );

      if (updateError) {
        throw updateError;
      }

      if (!userData.user?.id || !userData.user?.email) {
        throw new Error('User ID or email not found after password update');
      }

      // The trigger will handle updating the profile to use auth.users.id
      // We just need to ensure the profile exists and has the correct email
      // The trigger will migrate restaurant_employees and user_roles automatically

      toast.success('Password set successfully! You can now log in.');
      router.push('/auth/login');
    } catch (error: unknown) {
      console.error('Error setting password:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="bg-white shadow-xl rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Verifying Invitation
            </CardTitle>
            <CardDescription className="text-slate-600">
              Please wait while we verify your invitation link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="bg-white shadow-xl rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Set Your Password
          </CardTitle>
          <CardDescription className="text-slate-600">
            Please set a password to complete your account setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={isLoading || !sessionReady}
              >
                {isLoading ? 'Setting password...' : 'Set Password'}
              </Button>
              {!sessionReady && !isVerifying && (
                <p className="text-sm text-yellow-600 font-medium">
                  Please wait for the invitation to be verified...
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
