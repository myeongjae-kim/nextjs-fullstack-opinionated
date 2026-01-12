"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { ReactQueryProvider } from "./ReactQueryProvider";

function AuthGuard({ children }: { children: ReactNode }) {
  const { principal, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/use-apis/login" || pathname === "/use-apis/signup";
      const isAuthenticated = !!principal;

      if (!isAuthenticated && !isAuthPage) {
        router.push("/use-apis/login");
      } else if (isAuthenticated && isAuthPage) {
        router.push("/use-apis");
      }
    }
  }, [principal, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function UseApisLayout({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
