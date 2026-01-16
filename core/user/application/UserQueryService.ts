import type { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.ts';
import { UserDetails } from '@/core/auth/domain/UserDetails.ts';
import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.ts';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError.ts';
import { Autowired } from '@/core/config/Autowired.ts';
import { env } from '@/core/config/env.ts';
import { LoginUseCase } from '@/core/user/application/port/in/LoginUseCase.ts';
import { RefreshTokenUseCase } from '@/core/user/application/port/in/RefreshTokenUseCase.ts';
import type { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort.ts';
import { RefreshToken, UserLogin } from '@/core/user/domain/User.ts';
import * as bcrypt from '@felix/bcrypt';
import jwt from 'jsonwebtoken';

export class UserQueryService implements LoginUseCase, RefreshTokenUseCase {
  constructor(
    @Autowired('UserQueryPort')
    private readonly userQueryPort: UserQueryPort,
    @Autowired('GenerateTokenUseCase')
    private readonly generateTokenUseCase: GenerateTokenUseCase
  ) { }

  async login(userData: UserLogin): Promise<AuthResponse> {
    const user = await this.userQueryPort.findByLoginId(userData.loginId, { useReplica: true });

    if (!user) {
      throw new DomainUnauthorizedError('Invalid login credentials');
    }

    const isPasswordValid = await bcrypt.verify(userData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new DomainUnauthorizedError('Invalid login credentials');
    }

    const userDetails = new UserDetails(user.ulid, user.role);
    return this.generateTokenUseCase.generateToken(userDetails);
  }

  async refreshToken(refreshTokenData: RefreshToken): Promise<AuthResponse> {
    let decoded: { ulid: string };
    try {
      decoded = jwt.verify(refreshTokenData.refresh_token, env.AUTH_SECRET) as { ulid: string };
    } catch {
      throw new DomainUnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userQueryPort.findByUlid(decoded.ulid, { useReplica: true });

    if (!user) {
      throw new DomainNotFoundError(decoded.ulid, 'User');
    }

    const userDetails = new UserDetails(user.ulid, user.role);
    return this.generateTokenUseCase.generateToken(userDetails);
  }
}
