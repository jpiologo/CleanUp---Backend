import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CleanerProfileService } from './cleaner-profile.service';
import { CreateCleanerProfileDto, DisableCleanerProfileDto } from './dto/cleaner-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Cleaner Profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cleaner-profiles')
export class CleanerProfileController {
  constructor(private readonly service: CleanerProfileService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLEANER)
  @ApiOperation({ summary: 'Creates a cleaner profile (ADMIN and CLEANER only)' })
  @ApiResponse({ status: 201, description: 'Cleaner profile created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 403, description: 'Only users with CLEANER role can have a profile' })
  @ApiResponse({ status: 409, description: 'Cleaner profile already exists for this user' })
  async create(@Body() dto: CreateCleanerProfileDto) {
    return this.service.create(dto.userId, dto);
  }

  @Patch('disable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Disable a cleaner profile' })
  @ApiResponse({ status: 200, description: 'Cleaner profile disabled successfully' })
  @ApiResponse({ status: 404, description: 'Cleaner profile not found' })
  async disable(@Body() dto: DisableCleanerProfileDto) {
    return this.service.disable(dto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby cleaners by client address ID' })
  @ApiQuery({ name: 'addressId', required: true, description: 'ID of the address to use for proximity filtering' })
  @ApiResponse({ status: 200, description: 'List of nearby cleaner profiles' })
  @ApiResponse({ status: 400, description: 'Missing or invalid address ID' })
  @ApiResponse({ status: 404, description: 'Selected address with coordinates not found' })
  async getNearby(@CurrentUser() user: { id: string }, @Query('addressId', ParseUUIDPipe) addressId: string) {
    return this.service.findNearby(user.id, addressId);
  }

  @Get('')
  @ApiOperation({ summary: 'Get all registered cleaners' })
  @ApiResponse({ status: 200, description: 'List of cleaner profiles' })
  @ApiResponse({ status: 404, description: 'Bad Request' })
  async findAll() {
    return this.service.findAll();
  }
}