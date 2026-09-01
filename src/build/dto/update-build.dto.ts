import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsOptional, IsString } from "class-validator";
import { CreateBuildDto } from "./create-build.dto";

export class UpdateBuildDto extends PartialType(
  CreateBuildDto,
) { }