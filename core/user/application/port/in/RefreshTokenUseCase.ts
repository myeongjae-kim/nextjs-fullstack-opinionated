import { AuthResponse } from '@/core/common/domain/AuthResponse';
import { RefreshToken } from '@/core/user/domain/User';

export interface RefreshTokenUseCase {
  refreshToken(refreshToken: RefreshToken): Promise<AuthResponse>;
}
