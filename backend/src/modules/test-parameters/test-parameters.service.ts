import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTestParameterDto } from './dto/create-test-parameter.dto';
import { UpdateTestParameterDto } from './dto/update-test-parameter.dto';
import { CreateReferenceRangeDto } from './dto/create-reference-range.dto';
import { UpdateReferenceRangeDto } from './dto/update-reference-range.dto';

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
      include: {
        referenceRanges: {
          orderBy: [
            { ageGroup: 'asc' },
            { gender: 'asc' },
          ],
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.testParameter.findUnique({
      where: { id },
      include: {
        tests: true,
        referenceRanges: {
          orderBy: [
            { ageGroup: 'asc' },
            { gender: 'asc' },
          ],
        },
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

  // Reference Range Methods
  async addReferenceRange(testParameterId: number, createReferenceRangeDto: CreateReferenceRangeDto) {
    return this.prisma.parameterReferenceRange.create({
      data: {
        testParameterId,
        ...createReferenceRangeDto,
      },
      include: {
        testParameter: true,
      },
    });
  }

  async updateReferenceRange(id: number, updateReferenceRangeDto: UpdateReferenceRangeDto) {
    return this.prisma.parameterReferenceRange.update({
      where: { id },
      data: updateReferenceRangeDto,
      include: {
        testParameter: true,
      },
    });
  }

  async removeReferenceRange(id: number) {
    return this.prisma.parameterReferenceRange.delete({
      where: { id },
    });
  }

  async getReferenceRanges(testParameterId: number) {
    return this.prisma.parameterReferenceRange.findMany({
      where: { testParameterId },
      orderBy: [
        { ageGroup: 'asc' },
        { gender: 'asc' },
      ],
    });
  }

  async getReferenceRangeForPatient(testParameterId: number, age: number, gender: string | null) {
    // Yaş grubunu belirle
    let ageGroup: 'CHILD' | 'ADULT' | 'ELDERLY';
    if (age < 18) {
      ageGroup = 'CHILD';
    } else if (age < 65) {
      ageGroup = 'ADULT';
    } else {
      ageGroup = 'ELDERLY';
    }

    // Cinsiyeti belirle
    let genderEnum: 'MALE' | 'FEMALE' | 'BOTH' = 'BOTH';
    if (gender === 'MALE' || gender === 'Erkek' || gender === 'E') {
      genderEnum = 'MALE';
    } else if (gender === 'FEMALE' || gender === 'Kadın' || gender === 'K') {
      genderEnum = 'FEMALE';
    }

    // Önce spesifik cinsiyet ve yaş grubu için ara
    let range = await this.prisma.parameterReferenceRange.findUnique({
      where: {
        testParameterId_ageGroup_gender: {
          testParameterId,
          ageGroup,
          gender: genderEnum,
        },
      },
    });

    // Bulunamazsa BOTH için ara
    if (!range && genderEnum !== 'BOTH') {
      range = await this.prisma.parameterReferenceRange.findUnique({
        where: {
          testParameterId_ageGroup_gender: {
            testParameterId,
            ageGroup,
            gender: 'BOTH',
          },
        },
      });
    }

    return range;
  }
}

