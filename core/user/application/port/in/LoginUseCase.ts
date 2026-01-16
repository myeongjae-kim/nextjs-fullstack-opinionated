import { AuthResponse } from '@/core/common/domain/AuthResponse';
import { UserLogin } from '@/core/user/domain/User';

export interface LoginUseCase {
  login(user: UserLogin): Promise<AuthResponse>;
}
