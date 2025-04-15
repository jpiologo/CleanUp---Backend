import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

    return { message: 'Notification deleted successfully' }
  }
}
