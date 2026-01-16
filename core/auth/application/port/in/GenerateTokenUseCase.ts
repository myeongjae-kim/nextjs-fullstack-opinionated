import { UserDetails } from '@/core/auth/domain/UserDetails.js';
import { AuthResponse } from '@/core/common/domain/AuthResponse.js';

export interface GenerateTokenUseCase {
  generateToken(userDetails: UserDetails): AuthResponse;
}
