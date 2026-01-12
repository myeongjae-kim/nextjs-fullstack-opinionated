import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./login/actions";

export default function HomePage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>홈</CardTitle>
          <CardDescription>로그인에 성공했습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>환영합니다! 서버 액션 기반 인증 시스템이 정상적으로 작동하고 있습니다.</p>
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              로그아웃
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
