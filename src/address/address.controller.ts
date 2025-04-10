import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AddressService } from './address.service'
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto'
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator'

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the logged-in user' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an address by ID (must belong to the user)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address (max 5)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Maximum address limit reached' })
  create(@Body() dto: CreateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address (must belong to the user)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(@Param('id') id: string, @Body() dto: UpdateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.update(id, dto, user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address (must belong to the user)' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.id)
  }
}