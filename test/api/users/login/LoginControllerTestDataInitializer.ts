import { DatabaseClient } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

export class LoginControllerTestDataInitializer {
  constructor(private readonly dbClient: DatabaseClient) { }

  async initialize(): Promise<void> {
    // 모든 user 데이터 삭제
    await this.dbClient.delete(user);

    // 테스트용 유저 생성
    const testLoginId = "loginuser";
    const testPassword = "password123";
    const passwordHash = await bcrypt.hash(testPassword, 10);
    const testUlid = ulid();

    await this.dbClient.insert(user).values({
      ulid: testUlid,
      loginId: testLoginId,
      passwordHash: passwordHash,
      name: "Test User",
      role: "member",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}