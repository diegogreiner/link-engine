import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { ErrorResponseDto } from "src/common/dto/error-response.dto";
import { MessageResponseDto } from "src/common/dto/message-response.dto";
import { CreateLinkDto } from "./dto/create-link.dto";
import {
	CreatedLinkResponseDto,
	LinkListItemResponseDto,
	LinkResponseDto,
} from "./dto/link-response.dto";
import { UpdateLinkDto } from "./dto/update-link.dto";
import { LinksService } from "./links.service";

type AuthenticatedRequest = Request & {
	user: {
		sub: string;
		email: string;
	};
};

@ApiTags("Links")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Controller("links")
@UseGuards(JwtAuthGuard)
export class LinksController {
	constructor(private readonly linksService: LinksService) {}

	@Post()
	@ApiOperation({ summary: "Criar um link encurtado" })
	@ApiCreatedResponse({ type: CreatedLinkResponseDto })
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	create(@Body() dto: CreateLinkDto, @Req() req: AuthenticatedRequest) {
		return this.linksService.create(dto, req.user.sub);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Atualizar um link do usuário" })
	@ApiParam({ name: "id", format: "uuid" })
	@ApiOkResponse({ type: LinkResponseDto })
	@ApiBadRequestResponse({ type: ErrorResponseDto })
	@ApiNotFoundResponse({ type: ErrorResponseDto })
	update(
		@Param("id") id: string,
		@Body() dto: UpdateLinkDto,
		@Req() req: AuthenticatedRequest,
	) {
		return this.linksService.update(id, dto, req.user.sub);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Excluir um link do usuário" })
	@ApiParam({ name: "id", format: "uuid" })
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiNotFoundResponse({ type: ErrorResponseDto })
	remove(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
		return this.linksService.remove(id, req.user.sub);
	}

	@Get()
	@ApiOperation({ summary: "Listar os links do usuário" })
	@ApiOkResponse({ type: LinkListItemResponseDto, isArray: true })
	findAll(@Req() req: AuthenticatedRequest) {
		return this.linksService.findAll(req.user.sub);
	}

	@Get(":id")
	@ApiOperation({ summary: "Consultar um link do usuário" })
	@ApiParam({ name: "id", format: "uuid" })
	@ApiOkResponse({ type: LinkResponseDto })
	@ApiNotFoundResponse({ type: ErrorResponseDto })
	findOne(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
		return this.linksService.findOne(id, req.user.sub);
	}
}
