import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'JWT usado nas rotas privadas' })
  accessToken: string;

  @ApiProperty({ description: 'JWT usado para renovar a sessão' })
  refreshToken: string;
}

export class RegisterResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ example: 'ana@example.com' })
  email: string;
}
