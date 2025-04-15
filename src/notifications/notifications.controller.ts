import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Post()
    @ApiOperation({ summary: 'Register a new notification' })
    @ApiResponse({ status: 200, description: 'Notification successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid request body' })
    async create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
        return this.service.create(dto);
    }

    @Delete(':id')
    @Roles(UserRole.CLIENT, UserRole.CLEANER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a user notification (Only the user that belongs to the notification can delete it)' })
    @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden: not allowed to delete this notification' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string }) {
        return this.service.delete(id, user.id);
    }
}
