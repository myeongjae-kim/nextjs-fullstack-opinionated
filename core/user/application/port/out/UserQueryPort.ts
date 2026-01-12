import { SqlOptions } from "@/core/common/domain/SqlOptions";
import { User } from "@/core/user/domain/User";

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

export interface UserQueryPort {
  findByLoginId(loginId: string, queryOptions: SqlOptions): Promise<UserWithPasswordHash | null>;
  findByUlid(ulid: string, queryOptions: SqlOptions): Promise<User | null>;
}
