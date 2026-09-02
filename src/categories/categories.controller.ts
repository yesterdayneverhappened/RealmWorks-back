import { Controller, Get, Query } from "@nestjs/common";
import { CategoryService } from "./categories.service";
import { GetCategoriesDto } from "./dto/get-categories.dto";

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) { }

  @Get()
  getCategories(@Query() query: GetCategoriesDto) {
    return this.categoryService.getCategories(query.page, query.limit);
  }
}
