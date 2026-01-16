import { AuthResponse } from '@/core/common/domain/AuthResponse';
import { UserSignUp } from '@/core/user/domain/User';

export interface SignUpUseCase {
  signUp(user: UserSignUp): Promise<AuthResponse>;
}
