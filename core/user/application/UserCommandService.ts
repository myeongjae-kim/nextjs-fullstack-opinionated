import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { Autowired } from "@/core/config/Autowired";
import { env } from "@/core/config/env";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ulid } from "ulid";
import { UserSignUp } from "../domain/User";
import { SignUpUseCase } from "./port/in/SignUpUseCase";
import type { UserCommandPort } from "./port/out/UserCommandPort";
import type { UserQueryPort } from "./port/out/UserQueryPort";

export class UserCommandService implements SignUpUseCase {
  constructor(
    @Autowired("UserCommandPort")
    private readonly userCommandPort: UserCommandPort,
    @Autowired("UserQueryPort")
    private readonly userQueryPort: UserQueryPort
  ) { }

  async signUp(userData: UserSignUp): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const userUlid = ulid();

    const createdUser = await this.userCommandPort.createUser({
      ...userData,
      ulid: userUlid,
      passwordHash,
    });

    const user = await this.userQueryPort.findByUlid(createdUser.ulid, { useReplica: false });
    if (!user) {
      throw new Error("User not found after creation");
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
}
