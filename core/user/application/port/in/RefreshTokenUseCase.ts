import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { RefreshToken } from '@/core/user/domain/User.js';

export interface RefreshTokenUseCase {
  refreshToken(refreshToken: RefreshToken): Promise<AuthResponse>;
}
