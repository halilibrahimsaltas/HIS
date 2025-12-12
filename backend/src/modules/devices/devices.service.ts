import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateDeviceMappingDto } from './dto/create-device-mapping.dto';
import { DeviceConnectionService } from './device-connection.service';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private deviceConnectionService: DeviceConnectionService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const device = await this.prisma.device.create({
      data: createDeviceDto,
    });

    // Eğer aktif ise bağlantıyı başlat
    if (device.isActive) {
      await this.deviceConnectionService.connect(device.id);
    }

    return device;
  }

  async findAll() {
    return this.prisma.device.findMany({
      include: {
        mappings: {
          include: {
            testParameter: true,
          },
        },
        _count: {
          select: {
            results: {
              where: {
                status: 'PENDING',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.device.findUnique({
      where: { id },
      include: {
        mappings: {
          include: {
            testParameter: true,
          },
        },
        results: {
          where: {
            status: { in: ['PENDING', 'PROCESSING', 'ERROR'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new Error('Cihaz bulunamadı');
    }

    const updated = await this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });

    // Bağlantı durumunu yönet
    if (updateDeviceDto.isActive !== undefined) {
      if (updateDeviceDto.isActive && !device.isActive) {
        await this.deviceConnectionService.connect(id);
      } else if (!updateDeviceDto.isActive && device.isActive) {
        await this.deviceConnectionService.disconnect(id);
      }
    }

    return updated;
  }

  async remove(id: number) {
    // Önce bağlantıyı kes
    await this.deviceConnectionService.disconnect(id);
    return this.prisma.device.delete({
      where: { id },
    });
  }

  async addMapping(deviceId: number, createMappingDto: CreateDeviceMappingDto) {
    return this.prisma.deviceTestMapping.create({
      data: {
        deviceId,
        ...createMappingDto,
      },
      include: {
        testParameter: true,
      },
    });
  }

  async removeMapping(mappingId: number) {
    return this.prisma.deviceTestMapping.delete({
      where: { id: mappingId },
    });
  }

  async getMappings(deviceId: number) {
    return this.prisma.deviceTestMapping.findMany({
      where: { deviceId },
      include: {
        testParameter: true,
      },
    });
  }

  async getQueue(deviceId?: number) {
    const where = deviceId ? { deviceId } : {};
    return this.prisma.deviceResultQueue.findMany({
      where: {
        ...where,
        status: { in: ['PENDING', 'PROCESSING', 'ERROR'] },
      },
      include: {
        device: true,
        patient: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async retryProcessing(queueId: number) {
    return this.prisma.deviceResultQueue.update({
      where: { id: queueId },
      data: {
        status: 'PENDING',
        errorMessage: null,
      },
    });
  }
}

