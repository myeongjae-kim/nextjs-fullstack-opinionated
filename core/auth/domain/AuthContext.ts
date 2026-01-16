import { UserDetails } from '@/core/auth/domain/UserDetails.js';

export type AuthContext = {
  principal: UserDetails | null;
}