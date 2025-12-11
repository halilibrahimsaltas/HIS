import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        birthDate: new Date(createPatientDto.birthDate),
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            tests: {
              include: {
                test: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    const updateData: any = { ...updatePatientDto };
    if (updatePatientDto.birthDate) {
      updateData.birthDate = new Date(updatePatientDto.birthDate);
    }
    return this.prisma.patient.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }
}

