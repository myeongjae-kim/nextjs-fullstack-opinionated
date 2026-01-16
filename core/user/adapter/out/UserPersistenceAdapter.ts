import { SqlOptions } from '@/core/common/domain/SqlOptions.ts';
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate.ts';
import { Autowired } from '@/core/config/Autowired.ts';
import { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort.ts';
import { UserQueryPort, UserWithPasswordHash } from '@/core/user/application/port/out/UserQueryPort.ts';
import { User, UserSignUp } from '@/core/user/domain/User.ts';
import { user } from '@/lib/db/schema.ts';
import { eq } from 'drizzle-orm';

export class UserPersistenceAdapter implements UserCommandPort, UserQueryPort {
  constructor(
    @Autowired('TransactionTemplate')
    private readonly transactionTemplate: TransactionTemplate
  ) {}

  async createUser(userData: UserSignUp & { ulid: string; passwordHash: string }): Promise<Pick<User, 'id' | 'ulid'>> {
    return await this.transactionTemplate.execute({ useReplica: false }, async (tx) => {
      const result = await tx.insert(user).values({
        ulid: userData.ulid,
        loginId: userData.loginId,
        passwordHash: userData.passwordHash,
        name: userData.name,
        role: 'member',
      });

      const insertedId = Number(result[0].insertId);
      const insertedUser = await tx.select().from(user).where(eq(user.id, insertedId)).limit(1);

      const row = insertedUser[0];
      if (!row) {
        throw new Error('User not found after creation');
      }

      return {
        id: row.id,
        ulid: row.ulid,
      };
    });
  }

  async findByLoginId(loginId: string, sqlOptions: SqlOptions): Promise<UserWithPasswordHash | null> {
    return await this.transactionTemplate.execute(sqlOptions, async (tx) => {
      const results = await tx.select().from(user).where(eq(user.loginId, loginId)).limit(1);

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        ulid: row.ulid,
        name: row.name,
        loginId: row.loginId,
        passwordHash: row.passwordHash,
        role: row.role,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
  }

  async findByUlid(ulid: string, sqlOptions: SqlOptions): Promise<User | null> {
    return await this.transactionTemplate.execute(sqlOptions, async (tx) => {
      const results = await tx.select().from(user).where(eq(user.ulid, ulid)).limit(1);

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        ulid: row.ulid,
        name: row.name,
        loginId: row.loginId,
        role: row.role,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
  }
}
