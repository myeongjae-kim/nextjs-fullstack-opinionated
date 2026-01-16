import type { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.ts';
import { UserDetails } from '@/core/auth/domain/UserDetails.ts';
import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { DomainBadRequestError } from '@/core/common/domain/DomainBadRequestError.ts';
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate.ts';
import { Autowired } from '@/core/config/Autowired.ts';
import { SignUpUseCase } from '@/core/user/application/port/in/SignUpUseCase.ts';
import type { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort.ts';
import type { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort.ts';
import { UserSignUp } from '@/core/user/domain/User.ts';
import * as bcrypt from '@felix/bcrypt';
import { ulid } from '@std/ulid';

export class UserCommandService implements SignUpUseCase {
  constructor(
    @Autowired('UserCommandPort')
    private readonly userCommandPort: UserCommandPort,
    @Autowired('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
    @Autowired('GenerateTokenUseCase')
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    @Autowired('TransactionTemplate')
    private readonly transactionTemplate: TransactionTemplate
  ) { }

  async signUp(userData: UserSignUp): Promise<AuthResponse> {
    return await this.transactionTemplate.execute({ useReplica: false }, async () => {
      const passwordHash = await bcrypt.hash(userData.password);
      const userUlid = ulid();

      const existingUser = await this.userQueryPort.findByLoginId(userData.loginId, { useReplica: false });
      if (existingUser) {
        throw new DomainBadRequestError('User with this loginId already exists');
      }

      const createdUser = await this.userCommandPort.createUser({
        ...userData,
        ulid: userUlid,
        passwordHash,
      });

      const user = await this.userQueryPort.findByUlid(createdUser.ulid, { useReplica: false });
      if (!user) {
        throw new Error('User not found after creation');
      }

      const userDetails = new UserDetails(user.ulid, user.role);
      return this.generateTokenUseCase.generateToken(userDetails);
    });
  }
}
