"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Next.js Fullstack Template</CardTitle>
          <CardDescription>
            Hexagonal Architecture 기반의 Opinionated Next.js 템플릿입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/api/docs" className="w-full">
              <Button variant="outline" className="h-32 w-full flex-col gap-2">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="font-semibold">API 문서 보기</span>
              </Button>
            </Link>

            <Link href="/server-actions" className="w-full">
              <Button variant="outline" className="h-32 w-full flex-col gap-2">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <span className="font-semibold text-center">Server Actions<br />기반 인증</span>
              </Button>
            </Link>

            <Button variant="outline" className="h-32 w-full flex-col gap-2 cursor-not-allowed opacity-50" disabled>
              <Cpu className="h-8 w-8 text-gray-500" />
              <span className="font-semibold">API 기반 인증<br />(준비 중)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
