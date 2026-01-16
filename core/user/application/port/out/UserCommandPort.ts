import { User, UserSignUp } from '@/core/user/domain/User.ts';

export interface UserCommandPort {
  createUser(user: UserSignUp & { ulid: string; passwordHash: string }): Promise<Pick<User, 'id' | 'ulid'>>;
}
