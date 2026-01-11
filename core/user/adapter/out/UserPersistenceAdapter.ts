import { QueryOptions } from "@/core/common/domain/QueryOptions";
import { Autowired } from "@/core/config/Autowired";
import { UserCommandPort } from "@/core/user/application/port/out/UserCommandPort";
import { UserQueryPort, UserWithPasswordHash } from "@/core/user/application/port/out/UserQueryPort";
import { User, UserSignUp } from "@/core/user/domain/User";
import type { DbClientSelector } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class UserPersistenceAdapter implements UserCommandPort, UserQueryPort {
  constructor(
    @Autowired("DbClientSelector")
    private readonly dbClientSelector: DbClientSelector
  ) {
  }

  async createUser(userData: UserSignUp & { ulid: string; passwordHash: string }): Promise<Pick<User, "id" | "ulid">> {
    const db = this.dbClientSelector();
    const result = await db.insert(user).values({
      ulid: userData.ulid,
      loginId: userData.loginId,
      passwordHash: userData.passwordHash,
      name: userData.name,
      role: 'member',
    });

    const insertedId = Number(result[0].insertId);
    const insertedUser = await db.select().from(user).where(eq(user.id, insertedId)).limit(1);

    return {
      id: insertedUser[0].id,
      ulid: insertedUser[0].ulid,
    };
  }

  async findByLoginId(loginId: string, queryOptions: QueryOptions): Promise<UserWithPasswordHash | null> {
    const db = this.dbClientSelector({ useReplica: queryOptions.useReplica });
    const results = await db.select().from(user).where(eq(user.loginId, loginId)).limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
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
  }

  async findByUlid(ulid: string, queryOptions: QueryOptions): Promise<User | null> {
    const db = this.dbClientSelector({ useReplica: queryOptions.useReplica });
    const results = await db.select().from(user).where(eq(user.ulid, ulid)).limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      ulid: row.ulid,
      name: row.name,
      loginId: row.loginId,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
