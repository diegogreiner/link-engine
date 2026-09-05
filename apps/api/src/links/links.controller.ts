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
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { CreateLinkDto } from "./dto/create-link.dto";
import { UpdateLinkDto } from "./dto/update-link.dto";
import { LinksService } from "./links.service";

type AuthenticatedRequest = Request & {
	user: {
		sub: string;
		email: string;
	};
};

@Controller("links")
export class LinksController {
	constructor(private readonly linksService: LinksService) {}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() dto: CreateLinkDto, @Req() req: AuthenticatedRequest) {
		return this.linksService.create(dto, req.user.sub);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() dto: UpdateLinkDto,
		@Req() req: AuthenticatedRequest,
	) {
		return this.linksService.update(id, dto, req.user.sub);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
		return this.linksService.remove(id, req.user.sub);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get()
	findAll(@Req() req: AuthenticatedRequest) {
		return this.linksService.findAll(req.user.sub);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
		return this.linksService.findOne(id, req.user.sub);
	}
}
