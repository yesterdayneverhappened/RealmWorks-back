import { Controller, Get, Query } from "@nestjs/common";
import { TagService } from "./tags.service";
import { GetTagsDto } from "./dto/get-tags.dto";

@Controller('tags')
export class TagController {
  constructor(
    private readonly tagService: TagService,
  ) { }

  @Get()
  getTags(@Query() query: GetTagsDto) {
    return this.tagService.getTags(query.page, query.limit);
  }
}