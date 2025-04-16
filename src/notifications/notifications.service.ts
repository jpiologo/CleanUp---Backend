import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import {
  CreateNotificationDto,
  NotificationResponseDto,
} from './dto/notifications.dto'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const { userId, ...notificationData } = dto

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.notification.create({
      data: {
        ...notificationData,
        userId,
      },
    })

    return { message: 'Notification successfully created' }
  }

  async findAll(
    requestingUserId: string,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: requestingUserId },
      orderBy: { createdAt: 'desc' },
    })

    if (!notifications) {
      throw new NotFoundException(`It's kind of empty around here...`)
    }

    return notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }))
  }

  async markAsRead(
    notificationId: string,
    requestingUserId: string,
  ): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    if (notification.userId !== requestingUserId) {
      throw new ForbiddenException(
        'You are not allowed to update this notification',
      )
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return { message: 'Notification marked as read' }
  }

  async delete(
    notificationId: string,
    requestingUserId: string,
  ): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    if (notification.userId !== requestingUserId) {
      throw new ForbiddenException(
        'You are not allowed to delete this notification',
      )
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    })

    return { message: 'Successfully deleted ' }
  }
}
