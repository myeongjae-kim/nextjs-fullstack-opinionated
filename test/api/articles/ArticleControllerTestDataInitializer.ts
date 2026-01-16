import { TokenService } from '@/core/auth/application/TokenService.ts';
import { UserDetails } from '@/core/auth/domain/UserDetails.ts';
import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { DatabaseClient } from '@/lib/db/drizzle.ts';
import { article, user } from '@/lib/db/schema.ts';
import * as bcrypt from '@felix/bcrypt';
import { ulid } from '@std/ulid';

export class ArticleControllerTestDataInitializer {
  constructor(private readonly dbClient: DatabaseClient) { }

  async initialize(): Promise<AuthResponse> {
    // 모든 데이터 삭제
    await this.dbClient.delete(user);
    await this.dbClient.delete(article);

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

    // 테스트용 article id 1번 생성
    await this.dbClient.insert(article).values({
      id: 1,
      title: 'Article 1',
      content: 'Content of article 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new TokenService().generateToken(new UserDetails(testUlid, 'member'));
  }
}