import { SqlOptions } from '@/core/common/domain/SqlOptions.js';
import { User } from '@/core/user/domain/User.js';

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

export interface UserQueryPort {
  findByLoginId(loginId: string, sqlOptions: SqlOptions): Promise<UserWithPasswordHash | null>;
  findByUlid(ulid: string, sqlOptions: SqlOptions): Promise<User | null>;
}
