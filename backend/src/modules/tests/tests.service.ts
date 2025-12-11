import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async create(createTestDto: CreateTestDto) {
    const { parameterIds, ...testData } = createTestDto;
    
    return this.prisma.test.create({
      data: {
        ...testData,
        parameters: parameterIds && parameterIds.length > 0
          ? {
              connect: parameterIds.map(id => ({ id })),
            }
          : undefined,
      },
      include: {
        parameters: true,
      },
    });
  }

  async findAll() {
    return this.prisma.test.findMany({
      include: {
        parameters: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        parameters: true,
      },
    });
  }

  async update(id: number, updateTestDto: UpdateTestDto) {
    const { parameterIds, ...testData } = updateTestDto;
    
    // Önce mevcut parametreleri kaldır, sonra yenilerini ekle
    const currentTest = await this.prisma.test.findUnique({
      where: { id },
      include: { parameters: true },
    });

    if (parameterIds !== undefined) {
      await this.prisma.test.update({
        where: { id },
        data: {
          parameters: {
            set: parameterIds.map(paramId => ({ id: paramId })),
          },
        },
      });
    }

    return this.prisma.test.update({
      where: { id },
      data: testData,
      include: {
        parameters: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.test.delete({
      where: { id },
    });
  }

  async findAllParameters() {
    return this.prisma.testParameter.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findParametersByCategory(category: string) {
    return this.prisma.testParameter.findMany({
      where: {
        tests: {
          some: {
            category: category as any,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

