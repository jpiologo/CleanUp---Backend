/* biome-ignore lint/style/useDecorators: NestJS decorators are required */
import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUsersDto } from './dto/update-user.dto';

@ApiTags('users') // Nome da categoria no Swagger
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Usuário já cadastrado.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUsersDto: UpdateUsersDto) {
    return this.usersService.update(id, updateUsersDto);
  }

}
