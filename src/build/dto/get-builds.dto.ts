import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { BuildSort } from "../enums/build-sort";

export class GetBuildsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum([BuildSort])
    sort?: BuildSort = BuildSort.NEWEST;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    tags?: string;
}
