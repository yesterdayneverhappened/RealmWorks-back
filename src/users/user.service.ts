import { Injectable, NotFoundException, Param } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
    private users = [
        {id: 1, name: "John Doe", email: "john@gmail.com"},
        {id: 2, name: "Jane Goe", email: "johngoe@gmail.com"}
    ]

    getUsers() {
        return this.users;
    }

    getUser(id:string) {
        const user = this.users.find(user => user.id.toString() === id);

        if (!user) {
            throw new NotFoundException()
        }
        return user;
    }

    deleteUser(id:string) {
        const user = this.users.find(user => user.id.toString() === id);

        if (!user) {
            throw new NotFoundException()
        }
        return `Пользователь ${user.name} удалён`;
    }

    createUser(user:CreateUserDto) {
        return `Пользователь ${user.name} создан`
    }
}