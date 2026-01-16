import type { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.js';
import { UserDetails } from '@/core/auth/domain/UserDetails.js';
import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { DomainBadRequestError } from '@/core/common/domain/DomainBadRequestError.js';
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate.js';
import { Autowired } from '@/core/config/Autowired.js';
import { SignUpUseCase } from '@/core/user/application/port/in/SignUpUseCase.js';
import type { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort.js';
import type { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort.js';
import { UserSignUp } from '@/core/user/domain/User.js';
import bcrypt from 'bcrypt';
import { ulid } from 'ulid';

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
    return this.transactionTemplate.execute({ useReplica: false }, async () => {
      const passwordHash = await bcrypt.hash(userData.password, 10);
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
