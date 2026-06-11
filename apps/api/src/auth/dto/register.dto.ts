import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
	@ApiProperty({ example: "teste@gmail.com" })
	@IsEmail({}, { message: "Email inválido" })
	email: string;

	@ApiProperty({ example: "minha senha 1234@" })
	@IsString({ message: "Senha deve ser uma string" })
	@MinLength(8, { message: "Senha deve ter no mínimo 8 caracteres" })
	password: string;
}
