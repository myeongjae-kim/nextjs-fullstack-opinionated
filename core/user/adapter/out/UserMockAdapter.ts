import { SqlOptions } from '@/core/common/domain/SqlOptions.js';
import { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort.js';
import { UserQueryPort, UserWithPasswordHash } from '@/core/user/application/port/out/UserQueryPort.js';
import { User, UserSignUp } from '@/core/user/domain/User.js';

export class UserMockAdapter implements UserCommandPort, UserQueryPort {
  private users: UserWithPasswordHash[] = [
    {
      id: 1,
      ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      name: 'Test User',
      loginId: 'test@example.com',
      passwordHash: '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', // dummy hash
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async createUser(userData: UserSignUp & { ulid: string; passwordHash: string }): Promise<Pick<User, 'id' | 'ulid'>> {
    const newId = this.users.length + 1;
    const newUser: UserWithPasswordHash = {
      id: newId,
      ulid: userData.ulid,
      name: userData.name || null,
      loginId: userData.loginId,
      passwordHash: userData.passwordHash,
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return Promise.resolve({
      id: newUser.id,
      ulid: newUser.ulid,
    });
  }

  async findByLoginId(loginId: string, _sqlOptions: SqlOptions): Promise<UserWithPasswordHash | null> {
    const user = this.users.find((u) => u.loginId === loginId);
    return Promise.resolve(user ? { ...user } : null);
  }

  async findByUlid(ulid: string, _sqlOptions: SqlOptions): Promise<User | null> {
    const user = this.users.find((u) => u.ulid === ulid);
    if (!user) {
      return Promise.resolve(null);
    }
    // passwordHash를 제외하고 반환
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return Promise.resolve(userWithoutPassword);
  }
}
