import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { RefreshToken } from '@/core/user/domain/User.ts';

export interface RefreshTokenUseCase {
  refreshToken(refreshToken: RefreshToken): Promise<AuthResponse>;
}
