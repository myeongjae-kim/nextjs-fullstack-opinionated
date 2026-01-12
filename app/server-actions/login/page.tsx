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
import { loginAction, type LoginActionResult } from "./actions";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  loginId: z.string().min(1, "로그인 ID를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("loginId", data.loginId);
      formData.append("password", data.password);

      const result: LoginActionResult = await loginAction(formData);
      
      if (result.success) {
        router.push("/server-actions");
      } else {
        setError(result.error);
      }
    });
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
          <CardTitle>로그인</CardTitle>
          <CardDescription>계정에 로그인하세요</CardDescription>
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
            <Link href="/server-actions/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
