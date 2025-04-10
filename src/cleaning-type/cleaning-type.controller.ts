import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
  } from '@nestjs/swagger';
  import { CleaningTypeService } from './cleaning-type.service';
  import { CreateCleaningTypeDto } from './dto/cleaning-type.dto';
  import { UpdateCleaningTypeDto } from './dto/cleaning-type.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @ApiTags('Cleaning Types')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Controller('cleaning-types')
  export class CleaningTypeController {
    constructor(private readonly service: CleaningTypeService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all cleaning types' })
    @ApiResponse({ status: 200, description: 'List of all cleaning types' })
    findAll() {
      return this.service.findAll();
    }
  
    @Post()
    @ApiOperation({ summary: 'Create a new cleaning type' })
    @ApiResponse({ status: 201, description: 'Cleaning type created successfully' })
    create(@Body() dto: CreateCleaningTypeDto) {
      return this.service.create(dto);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a cleaning type by ID' })
    @ApiParam({ name: 'id', description: 'Cleaning type ID' })
    @ApiResponse({ status: 200, description: 'Cleaning type updated successfully' })
    update(@Param('id') id: string, @Body() dto: UpdateCleaningTypeDto) {
      return this.service.update(id, dto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a cleaning type by ID' })
    @ApiParam({ name: 'id', description: 'Cleaning type ID' })
    @ApiResponse({ status: 200, description: 'Cleaning type deleted successfully' })
    remove(@Param('id') id: string) {
      return this.service.remove(id);
    }
  }