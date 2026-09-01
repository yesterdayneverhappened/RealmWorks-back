import { IsArray, IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateBuildDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @MaxLength(228)
    description: string;

    @IsArray()
    photos: string[];

    @IsString()
    schematicUrl: string;

    @IsNotEmpty()
    @IsString()
    categoryId: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];
}