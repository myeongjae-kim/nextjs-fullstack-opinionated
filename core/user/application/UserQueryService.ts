import type { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.js';
import { UserDetails } from '@/core/auth/domain/UserDetails.js';
import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.js';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError.js';
import { Autowired } from '@/core/config/Autowired.js';
import { env } from '@/core/config/env.js';
import { LoginUseCase } from '@/core/user/application/port/in/LoginUseCase.js';
import { RefreshTokenUseCase } from '@/core/user/application/port/in/RefreshTokenUseCase.js';
import type { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort.js';
import { RefreshToken, UserLogin } from '@/core/user/domain/User.js';
import bcrypt from 'bcrypt';
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

    const isPasswordValid = await bcrypt.compare(userData.password, user.passwordHash);
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
