import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post("login")
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Post("refresh")
	refresh(
		@Body()
		body: { refreshToken: string },
	) {
		return this.authService.refresh(body.refreshToken);
	}

	@Post("logout")
	logout(@Req() req: Request) {
		const user = req.user as {
			sub: string;
			email: string;
		};

		return this.authService.logout(user.sub);
	}
}
