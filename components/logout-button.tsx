'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOutUser } from '@/infra/auth/helpers/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AUTH_SESSION_QUERY_KEY,
  USER_ID_QUERY_KEY,
} from '@/lib/constants/query-keys';

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    await signOutUser();
    // Invalidate auth queries to clear cached session
    queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: USER_ID_QUERY_KEY });
    router.push('/auth/login');
  };

  return (
    <Button variant="destructive" onClick={logout}>
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
