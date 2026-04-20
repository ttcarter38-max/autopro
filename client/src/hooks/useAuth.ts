import { useQuery } from '@tanstack/react-query';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone: string | null;
}

export function useAuth() {
  const { data, isLoading } = useQuery<{ user: AuthUser } | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Failed to load user');
      return res.json();
    },
  });

  return {
    user: data?.user ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    isAdmin: data?.user?.role === 'admin',
    isCustomer: data?.user?.role === 'customer',
  };
}
