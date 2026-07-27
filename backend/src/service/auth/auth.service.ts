import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Response, Request } from "express";
import { AuthDTO } from "../../shared/model/auth/auth.dto";
import { MessageUtil } from "../../shared/util/message.util";
import { ConstantUtil } from "../../shared/util/constant.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService,
  ) {}

  async login(dto: AuthDTO, res: Response): Promise<Response> {
    const { sessionId, userGroup, contractNumber, partnerName } = await this.validateUser(dto);
    let payload;
    if (dto.isAdmin) {
      payload = { username: dto.username, userGroup: userGroup }
    } else {
      await this.processLoginByContract(contractNumber, partnerName);
      payload = { username: dto.username, contractNumber: contractNumber }
    }
    const jwt = this.jwtService.sign(payload);
    const sankhyaMemory = {
      auth: dto,
      jSessionId: sessionId,
    };
    await this.cacheManager.set(dto.username, sankhyaMemory);
    res.cookie(ConstantUtil.JWT_TOKEN, jwt, {
      path: "/",
      secure: false,
      httpOnly: true,
      sameSite: false,
    });
    return res.status(200).send({
      username: dto.username,
    });
  }

  async validateUser(dto: AuthDTO): Promise<any> {
    try {
      return await this.sankhyaService.doLogin(dto);
    } catch (error) {
      throw new BadRequestException(error.message ?? MessageUtil.VALIDATE_USER_FAILURE);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      if (req["user"] && req["user"].username) {
        await this.cacheManager.del(req["user"].username);
      }
    } finally {
      res.clearCookie(ConstantUtil.JWT_TOKEN, { path: "/" });
      res.status(200).send();
    }
  }

  async checkToken(token: string) {
    try {
      return this.jwtService.verify(token.replace("Bearer ", ""));
    } catch (err) {
      throw err;
    }
  }

  async processLoginByContract(contractNumber: number, partnerName: string) {
    const user: UserEntity | null = await this.userService.getUserById(contractNumber);
    if (user) {
      await this.userService.updateLastAccess(user.id);
      return;
    }
    await this.userService.saveUserLoggedIn(contractNumber, partnerName);
  }
}
