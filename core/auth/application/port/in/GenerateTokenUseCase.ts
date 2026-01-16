import { UserDetails } from '@/core/auth/domain/UserDetails.ts';
import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';

export interface GenerateTokenUseCase {
  generateToken(userDetails: UserDetails): AuthResponse;
}
