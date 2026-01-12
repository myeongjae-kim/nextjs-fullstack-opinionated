"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export default function HomePage() {
  const { principal, logout } = useAuth();

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>홈 (API)</CardTitle>
          <CardDescription>localStorage 기반 인증에 성공했습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>환영합니다! API 기반 인증 시스템이 정상적으로 작동하고 있습니다.</p>
          {principal && (
            <div className="p-4 bg-muted rounded-md space-y-2">
              <p><strong>내 정보:</strong></p>
              <p>ULID: {principal.ulid}</p>
              <p>역할: {principal.role}</p>
            </div>
          )}
          <Button onClick={logout} variant="outline">
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
