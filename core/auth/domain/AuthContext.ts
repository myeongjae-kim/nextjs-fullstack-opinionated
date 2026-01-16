import { UserDetails } from '@/core/auth/domain/UserDetails.ts';

export type AuthContext = {
  principal: UserDetails | null;
}