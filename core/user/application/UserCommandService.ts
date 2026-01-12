import type { GenerateTokenUseCase } from "@/core/auth/application/port/in/GenerateTokenUseCase";
import { UserDetails } from "@/core/auth/domain/UserDetails";
import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { DomainBadRequestError } from "@/core/common/domain/DomainBadRequestError";
import { TransactionTemplate } from "@/core/common/domain/TransactionTemplate";
import { Autowired } from "@/core/config/Autowired";
import bcrypt from "bcrypt";
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
    private readonly userQueryPort: UserQueryPort,
    @Autowired("GenerateTokenUseCase")
    private readonly generateTokenUseCase: GenerateTokenUseCase,
    @Autowired("TransactionTemplate")
    private readonly transactionTemplate: TransactionTemplate
  ) { }

  async signUp(userData: UserSignUp): Promise<AuthResponse> {
    return this.transactionTemplate.execute({ useReplica: false }, async () => {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const userUlid = ulid();

      const existingUser = await this.userQueryPort.findByLoginId(userData.loginId, { useReplica: false });
      if (existingUser) {
        throw new DomainBadRequestError("User with this loginId already exists");
      }

      const createdUser = await this.userCommandPort.createUser({
        ...userData,
        ulid: userUlid,
        passwordHash,
      });

      const user = await this.userQueryPort.findByUlid(createdUser.ulid, { useReplica: false });
      if (!user) {
        throw new Error("User not found after creation");
      }

      const userDetails = new UserDetails(user.ulid, user.role);
      return this.generateTokenUseCase.generateToken(userDetails);
    });
  }
}
