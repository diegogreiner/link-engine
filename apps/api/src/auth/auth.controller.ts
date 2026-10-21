import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { minutes, Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { ErrorResponseDto } from "src/common/dto/error-response.dto";
import { MessageResponseDto } from "src/common/dto/message-response.dto";
import { AuthService } from "./auth.service";
import {
	AuthTokensResponseDto,
	RegisterResponseDto,
} from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard";

type AuthenticatedRequest = Request & {
	user: {
		sub: string;
		email: string;
	};
};

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Throttle({
		default: {
			limit: 20,
			ttl: minutes(1),
		},
	})
	@Post("register")
	@ApiSecurity({})
	@ApiOperation({ summary: "Cadastrar um usuário e iniciar uma sessão" })
	@ApiCreatedResponse({ type: RegisterResponseDto })
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	@ApiConflictResponse({
		description: "O e-mail já está cadastrado",
		type: ErrorResponseDto,
	})
	@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Throttle({
		default: {
			limit: 20,
			ttl: minutes(1),
		},
	})
	@Post("login")
	@ApiSecurity({})
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Autenticar um usuário" })
	@ApiOkResponse({ type: AuthTokensResponseDto })
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	@ApiUnauthorizedResponse({ type: ErrorResponseDto })
	@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Throttle({
		default: {
			limit: 20,
			ttl: minutes(1),
		},
	})
	@Post("refresh")
	@ApiSecurity({})
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Renovar os tokens da sessão" })
	@ApiOkResponse({ type: AuthTokensResponseDto })
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	@ApiUnauthorizedResponse({ type: ErrorResponseDto })
	@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
	refresh(@Body() body: RefreshTokenDto) {
		return this.authService.refresh(body.refreshToken);
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Encerrar todas as sessões do usuário" })
	@ApiBearerAuth("bearer")
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse({ type: ErrorResponseDto })
	@ApiForbiddenResponse({ type: ErrorResponseDto })
	@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
	@UseGuards(JwtAuthGuard)
	logout(@Req() req: AuthenticatedRequest) {
		return this.authService.logout(req.user.sub);
	}
}
