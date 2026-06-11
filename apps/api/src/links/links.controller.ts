import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { CreateLinkDto } from "./dto/create-link.dto";
import { UpdateLinkDto } from "./dto/update-link.dto";
import { LinksService } from "./links.service";

@Controller("links")
export class LinksController {
	constructor(private readonly linksService: LinksService) {}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() dto: CreateLinkDto, @Req() req) {
		return this.linksService.create(dto, req.user.sub);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateLinkDto) {
		return this.linksService.update(id, dto);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.linksService.remove(id);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get()
	findAll() {
		return this.linksService.findAll();
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.linksService.findOne(id);
	}
	

	@Get(":shortCode")
	async redirect(@Param("shortCode") shortCode: string, @Res() res: Response) {
		const link = await this.linksService.findByShortCode(shortCode);
		return res.redirect(302, link.originalUrl);
	}
}
