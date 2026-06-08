import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { PrismaService } from "src/prisma/service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});

		if (existingUser) {
			throw new ConflictException("Email já cadastrado");
		}

		const passwordHash = await bcrypt.hash(dto.password, 10);

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				passwordHash,
			},
		});

		const tokens = await this.generateTokens(user.id, user.email);

		return {
			email: user?.email,
			...tokens,
		};
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});

		if (!user) throw new UnauthorizedException();

		const passwordMatches = await bcrypt.compare(
			dto.password,
			user.passwordHash,
		);

		if (!passwordMatches) {
			throw new UnauthorizedException();
		}

		const tokens = await this.generateTokens(user.id, user.email);

		return tokens;
	}

	async logout(userId: string) {
		await this.prisma.refreshToken.deleteMany({
			where: {
				id: userId,
			},
		});

		return {
			message: "Logout realizado",
		};
	}

	async refresh(refreshToken: string) {
		try {
			const payload = await this.jwt.verifyAsync(
			refreshToken,
			{
				secret: process.env.JWT_REFRESH_SECRET,
			},
			);

			const tokens =
			await this.prisma.refreshToken.findMany({
				where: {
				userId: payload.sub,
				},
			});

			const validToken = await Promise.any(
			tokens.map(async (token) => {
				const match = await bcrypt.compare(
				refreshToken,
				token.token,
				);

				return match ? token : Promise.reject();
			}),
			);

			if (!validToken) {
			throw new UnauthorizedException();
			}

			return this.generateTokens(
			payload.sub,
			payload.email,
			);
		} catch {
			throw new UnauthorizedException();
		}
	}

	private async generateTokens(userId: string, email: string) {
		const payload = {
			sub: userId,
			email,
		};

		const accessToken = await this.jwt.signAsync(payload, {
			secret: process.env.JWT_ACCESS_SECRET,
			expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
		});

		const refreshToken = await this.jwt.signAsync(payload, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: process.env.JWT_REFRESH_EXPIRES as any,
		});

		const hashRefresh = await bcrypt.hash(refreshToken, 10);

		await this.prisma.refreshToken.create({
			data: {
				userId,
				token: hashRefresh,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});

		return {
			accessToken,
			refreshToken,
		};
	}
}
