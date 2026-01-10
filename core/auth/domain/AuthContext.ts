import { UserDetails } from "@/core/auth/domain/UserDetails";

export type AuthContext = {
  principal: UserDetails | null;
}