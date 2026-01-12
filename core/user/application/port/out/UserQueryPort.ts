import { SqlOptions } from "@/core/common/domain/SqlOptions";
import { User } from "@/core/user/domain/User";

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

export interface UserQueryPort {
  findByLoginId(loginId: string, sqlOptions: SqlOptions): Promise<UserWithPasswordHash | null>;
  findByUlid(ulid: string, sqlOptions: SqlOptions): Promise<User | null>;
}
