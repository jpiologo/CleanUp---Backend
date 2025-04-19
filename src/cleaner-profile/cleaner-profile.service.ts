import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCleanerProfileDto, UpdateCleanerProfileDto, DisableCleanerProfileDto, CleanerProfileWithUserDto } from './dto/cleaner-profile.dto';

@Injectable()
export class CleanerProfileService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCleanerProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user ||user.role !== 'CLEANER') {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User not found or inactive');
    }

    const existing = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ForbiddenException('This user already has a cleaner profile');
    }

    return this.prisma.cleanerProfile.create({
      data: {
        userId,
        bio: dto.bio,
        stripeAccountId: dto.stripeAccountId,
      },
    });
  }

  async findAll(): Promise<CleanerProfileWithUserDto[]> {
    return this.prisma.cleanerProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      }
    })
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

  async disable(dto: DisableCleanerProfileDto) {
    const { userId } = dto;
    const profile = await this.prisma.cleanerProfile.findUnique({ where: { userId } });
    
    if (!profile) throw new NotFoundException('Cleaner profile not found');

    if (!profile.isActive) {
      throw new ForbiddenException('Cleaner profile is already disabled');
    }

    return this.prisma.cleanerProfile.update({
      where: { userId },
      data: {
        isActive: false,
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