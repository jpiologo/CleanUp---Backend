import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCleanerProfileDto, UpdateCleanerProfileDto, DisableCleanerProfileDto } from './dto/cleaner-profile.dto';

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

  async disable(userId: string, dto: DisableCleanerProfileDto) {
    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Cleaner profile not found');

    return this.prisma.cleanerProfile.update({
      where: { userId },
      data: {
        isActive: dto.isActive,
      },
    });
  }

  async findNearby(clientId: string, addressId: string) {
    const clientAddress = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: clientId,
      },
    });

    if (!clientAddress?.latitude || !clientAddress?.longitude) {
      throw new NotFoundException('Selected address with coordinates not found');
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
      const address = cleaner.user?.addresses.find(addr => addr.isPrimary);
      if (!address || !clientAddress.longitude || !address.latitude || !address.longitude || !clientAddress.latitude ) return false;

      const dist = Math.sqrt(
        (address.latitude - clientAddress.latitude) ** 2 +
        (address.longitude - clientAddress.longitude) ** 2
      );

      return dist < 0.2;
    });

    return nearbyCleaners;
  }
}