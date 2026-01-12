"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../AuthContext";

const loginSchema = z.object({
  loginId: z.string().min(1, "로그인 ID를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsPending(true);
    
    const result = await login(data.loginId, data.password);
    
    if (result.success) {
      router.push("/use-apis");
    } else {
      setError(result.error || "로그인에 실패했습니다.");
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            메인으로 돌아가기
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>로그인 (API)</CardTitle>
          <CardDescription>localStorage 기반 API 인증 테스트</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="loginId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>로그인 ID</FormLabel>
                    <FormControl>
                      <Input placeholder="로그인 ID를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/use-apis/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
