import { UserDetails } from "@/core/auth/domain/UserDetails";
import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { env } from "@/core/config/env";
import jwt from "jsonwebtoken";
import { GenerateTokenUseCase } from "./port/in/GenerateTokenUseCase";

export class TokenService implements GenerateTokenUseCase {
  generateToken(userDetails: UserDetails): AuthResponse {
    const accessToken = jwt.sign(
      { ulid: userDetails.ulid, role: userDetails.role },
      env.AUTH_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { ulid: userDetails.ulid },
      env.AUTH_SECRET,
      { expiresIn: '180d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
