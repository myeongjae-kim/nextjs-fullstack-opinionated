import { UserDetails } from "@/core/auth/domain/UserDetails";
import { AuthResponse } from "@/core/common/domain/AuthResponse";

export interface GenerateTokenUseCase {
  generateToken(userDetails: UserDetails): AuthResponse;
}
