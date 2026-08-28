import { IsArray, IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateBuildDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @MaxLength(228)
    description: string;

    @IsArray()
    @IsUrl({}, {each: true})
    photos: string[];

    @IsString()
    @IsUrl()
    schematicUrl: string;
}