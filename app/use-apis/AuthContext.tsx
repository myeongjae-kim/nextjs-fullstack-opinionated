'use client';

import { $api } from '@/app/use-apis/$api';
import { paths } from '@/lib/api/schema';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type User = paths['/api/users/me']['get']['responses']['200']['content']['application/json'];
type AuthToken = paths['/api/users/login']['post']['responses']['200']['content']['application/json'];

interface AuthContextType {
  principal: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (loginId: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 초기 로드 시 localStorage에서 토큰 확인
  useEffect(() => {
    const authData = localStorage.getItem('@nextjs-fullstack-opinionated/authToken');
    if (authData) {
      try {
        const parsed = JSON.parse(authData) as AuthToken;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccessToken(parsed.access_token || null);
      } catch (e) {
        console.error('Failed to parse authToken from localStorage', e);
        localStorage.removeItem('@nextjs-fullstack-opinionated/authToken');
      }
    }

    setIsInitializing(false);
  }, []);

  // openapi-react-query 훅 사용
  // enabled가 false가 되면 principalData는 undefined가 되거나 이전 값을 유지할 수 있음
  const { data: principalData, isLoading: isQueryLoading, refetch } = $api.useQuery('get', '/api/users/me', undefined, {
    enabled: !!accessToken,
    retry: false,
  });

  const { mutateAsync: loginMutation } = $api.useMutation('post', '/api/users/login');
  const { mutateAsync: signupMutation } = $api.useMutation('post', '/api/users/signup');

  const login = useCallback(async (loginId: string, password: string) => {
    try {
      const data = await loginMutation({
        body: { loginId, password },
      });

      if (data) {
        // 서버에서 받은 data 객체 전체를 stringify해서 저장
        localStorage.setItem('@nextjs-fullstack-opinionated/authToken', JSON.stringify(data));
        setAccessToken(data.access_token);
        await refetch();
        return { success: true };
      }
      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (e) {
      console.error('Login failed:', e);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  }, [loginMutation, refetch]);

  const signup = useCallback(async (loginId: string, password: string, name?: string) => {
    try {
      const data = await signupMutation({
        body: { loginId, password, name },
      });

      if (data) {
        // 서버에서 받은 data 객체 전체를 stringify해서 저장
        localStorage.setItem('@nextjs-fullstack-opinionated/authToken', JSON.stringify(data));
        setAccessToken(data.access_token);
        await refetch();
        return { success: true };
      }
      return { success: false, error: '회원가입에 실패했습니다.' };
    } catch (e) {
      console.error('Signup failed:', e);
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    }
  }, [signupMutation, refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem('@nextjs-fullstack-opinionated/authToken');
    setAccessToken(null);
    queryClient.clear();
    router.push('/use-apis/login');
  }, [queryClient, router]);

  const value = useMemo(() => {
    // 토큰이 없으면 즉시 null 반환하여 principal을 reset 함
    const principal = accessToken ? (principalData ?? null) : null;

    return {
      principal,
      isAuthenticated: !!principal,
      isLoading: isInitializing || (!!accessToken && isQueryLoading),
      login,
      signup,
      logout,
    };
  }, [accessToken, principalData, isInitializing, isQueryLoading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
