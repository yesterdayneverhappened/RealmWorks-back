import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { use } from "passport";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }

    @UseGuards(JwtAuthGuard)
    @Patch('me/password')
    updatePassword(
        @CurrentUser() user: { id:string },
        @Body() dto: UpdatePasswordDto,
    ) {
        return this.userService.updatePassword(user.id, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: { id: string }) {
        return this.userService.getMe(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(
        @CurrentUser() user: { id: string },
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.updateMe(user.id, updateUserDto)
    }

    @Get(':id')
    getUser(@Param('id') id:string) {
        return this.userService.getUser(id)
    }

  @Post()
  createUser(@Body() userCreateDto: CreateUserDto) {
    return this.userService.createUser(userCreateDto);
  }
}
