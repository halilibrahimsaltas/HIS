import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTestParameterDto } from './dto/create-test-parameter.dto';
import { UpdateTestParameterDto } from './dto/update-test-parameter.dto';

@Injectable()
export class TestParametersService {
  constructor(private prisma: PrismaService) {}

  async create(createTestParameterDto: CreateTestParameterDto) {
    return this.prisma.testParameter.create({
      data: createTestParameterDto,
    });
  }

  async findAll() {
    return this.prisma.testParameter.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.testParameter.findUnique({
      where: { id },
      include: {
        tests: true,
      },
    });
  }

  async update(id: number, updateTestParameterDto: UpdateTestParameterDto) {
    return this.prisma.testParameter.update({
      where: { id },
      data: updateTestParameterDto,
    });
  }

  async remove(id: number) {
    return this.prisma.testParameter.delete({
      where: { id },
    });
  }
}

