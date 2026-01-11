import { QueryOptions } from "@/core/common/domain/QueryOptions";
import { User } from "@/core/user/domain/User";

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

export interface UserQueryPort {
  findByLoginId(loginId: string, queryOptions: QueryOptions): Promise<UserWithPasswordHash | null>;
  findByUlid(ulid: string, queryOptions: QueryOptions): Promise<User | null>;
}
