import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { UserSignUp } from '@/core/user/domain/User.js';

export interface SignUpUseCase {
  signUp(user: UserSignUp): Promise<AuthResponse>;
}
