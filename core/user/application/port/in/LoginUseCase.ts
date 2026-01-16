import { AuthResponse } from '@/core/common/domain/AuthResponse.js';
import { UserLogin } from '@/core/user/domain/User.js';

export interface LoginUseCase {
  login(user: UserLogin): Promise<AuthResponse>;
}
