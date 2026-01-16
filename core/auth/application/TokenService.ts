import { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.ts';
import { UserDetails } from '@/core/auth/domain/UserDetails.ts';
import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { env } from '@/core/config/env.ts';
import jwt from 'jsonwebtoken';

export class TokenService implements GenerateTokenUseCase {
  generateToken(userDetails: UserDetails): AuthResponse {
    const accessToken = jwt.sign(
      { ulid: userDetails.ulid, role: userDetails.role },
      env.AUTH_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { ulid: userDetails.ulid },
      env.AUTH_SECRET,
      { expiresIn: '180d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
