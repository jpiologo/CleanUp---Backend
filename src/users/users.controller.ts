/* biome-ignore lint/style/useDecorators: NestJS decorators are required */
import { Controller, Post, Body, Patch, Param, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UpdateUsersDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users') // Nome da categoria no Swagger
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users or a specific one' })
  @ApiQuery({ name: 'id', required: false, description: 'User ID (opcional)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'User not found if ID provided' })
  findAllOrOne(@Query('id') id?: string) {
    if (id) {
      return this.usersService.findOne(id);
    }
    return this.usersService.findAll();
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 409, description: 'User already exists' })
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
