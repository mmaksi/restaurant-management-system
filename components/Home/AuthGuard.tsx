import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default async function AuthGuard() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return <Dashboard />;
}
