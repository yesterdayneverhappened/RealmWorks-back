import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService){}
    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    @Get(':id')
    getUser(@Param('id') id:string) {
        return this.userService.getUser(id)
    }

    @Delete(':id')
    deleteUser(@Param('id') id:string) {
        return this.userService.deleteUser(id)
    }

    @Post()
    createUser(@Body() userCreateDto: CreateUserDto) {
        return this.userService.createUser(userCreateDto)
    }
}