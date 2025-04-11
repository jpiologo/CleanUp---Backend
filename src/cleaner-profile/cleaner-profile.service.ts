import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCleanerProfileDto, UpdateCleanerProfileDto } from './dto/cleaner-profile.dto';

@Injectable()
export class CleanerProfileService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCleanerProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'CLEANER') {
      throw new ForbiddenException('Only users with CLEANER role can have a profile');
    }

    const existing = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ForbiddenException('This user already has a cleaner profile');
    }

    return this.prisma.cleanerProfile.create({
      data: {
        userId,
        bio: dto.bio,
      },
    });
  }

  async update(userId: string, dto: UpdateCleanerProfileDto) {
    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Cleaner profile not found');

    return this.prisma.cleanerProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
      },
    });
  }

  async findNearby(clientId: string) {
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: { addresses: true },
    });

    const clientAddress = client && Array.isArray(client.addresses)
      ? client.addresses.find((a: any) => a.isPrimary)
      : null;

    if (!clientAddress || clientAddress.latitude == null || clientAddress.longitude == null) {
      throw new NotFoundException('Client primary address with coordinates not found');
    }

    const allCleaners = await this.prisma.cleanerProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          include: {
            addresses: true,
          },
        },
      },
    });

    const nearbyCleaners = allCleaners.filter(cleaner => {
      const address = Array.isArray(cleaner.user?.addresses)
        ? cleaner.user.addresses.find((a: any) => a.isPrimary)
        : null;
      if (!address || address.latitude == null || address.longitude == null) return false;

      const dist = Math.sqrt(
        Math.pow(address.latitude - clientAddress.latitude, 2) +
        Math.pow(address.longitude - clientAddress.longitude, 2),
      );

      return dist < 0.2;
    });

    return nearbyCleaners;
  }
}