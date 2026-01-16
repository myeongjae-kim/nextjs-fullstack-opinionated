import { DatabaseClient } from '@/lib/db/drizzle.ts';
import { user } from '@/lib/db/schema.ts';
import * as bcrypt from '@felix/bcrypt';
import { ulid } from '@std/ulid';

export class LoginControllerTestDataInitializer {
  constructor(private readonly dbClient: DatabaseClient) { }

  async initialize(): Promise<void> {
    // 모든 user 데이터 삭제
    await this.dbClient.delete(user);

    // 테스트용 유저 생성
    const testLoginId = 'loginuser';
    const testPassword = 'password123';
    const passwordHash = await bcrypt.hash(testPassword);
    const testUlid = ulid();

    await this.dbClient.insert(user).values({
      ulid: testUlid,
      loginId: testLoginId,
      passwordHash: passwordHash,
      name: 'Test User',
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}