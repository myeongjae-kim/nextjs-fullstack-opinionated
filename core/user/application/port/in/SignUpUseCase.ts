import { AuthResponse } from '@/core/common/domain/AuthResponse.ts';
import { UserSignUp } from '@/core/user/domain/User.ts';

export interface SignUpUseCase {
  signUp(user: UserSignUp): Promise<AuthResponse>;
}
