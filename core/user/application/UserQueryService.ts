import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { Autowired } from "@/core/config/Autowired";
import { env } from "@/core/config/env";
import { LoginUseCase } from "./port/in/LoginUseCase";
import { RefreshTokenUseCase } from "./port/in/RefreshTokenUseCase";
import type { UserQueryPort } from "./port/out/UserQueryPort";
import { RefreshToken, UserLogin } from "../domain/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserQueryService implements LoginUseCase, RefreshTokenUseCase {
  constructor(
    @Autowired("UserQueryPort")
    private readonly userQueryPort: UserQueryPort
  ) { }

  async login(userData: UserLogin): Promise<AuthResponse> {
    const user = await this.userQueryPort.findByLoginId(userData.loginId, { useReplica: false });

    if (!user) {
      throw new DomainUnauthorizedError('Invalid login credentials');
    }

    const isPasswordValid = await bcrypt.compare(userData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new DomainUnauthorizedError('Invalid login credentials');
    }

    const accessToken = jwt.sign(
      { ulid: user.ulid, role: user.role },
      env.AUTH_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { ulid: user.ulid },
      env.AUTH_SECRET,
      { expiresIn: '180d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshTokenData: RefreshToken): Promise<AuthResponse> {
    let decoded: { ulid: string };
    try {
      decoded = jwt.verify(refreshTokenData.refresh_token, env.AUTH_SECRET) as { ulid: string };
    } catch {
      throw new DomainUnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userQueryPort.findByUlid(decoded.ulid, { useReplica: false });

    if (!user) {
      throw new DomainNotFoundError(decoded.ulid, "User");
    }

    const accessToken = jwt.sign(
      { ulid: user.ulid, role: user.role },
      env.AUTH_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { ulid: user.ulid },
      env.AUTH_SECRET,
      { expiresIn: '180d' }
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
