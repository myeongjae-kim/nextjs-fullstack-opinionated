import { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.js';
import { UserDetails } from '@/core/auth/domain/UserDetails.js';
import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { env } from '@/core/config/env.js';
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
