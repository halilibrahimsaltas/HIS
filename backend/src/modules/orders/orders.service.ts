import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { patientId, tests } = createOrderDto;

    // Test fiyatlarını al
    const testIds = tests.map((t) => t.testId);
    const testData = await this.prisma.test.findMany({
      where: {
        id: { in: testIds },
      },
      include: {
        parameters: true,
      },
    });

    // Toplam fiyatı hesapla
    const total = testData.reduce((sum, test) => sum + test.price, 0);

    // Order ve OrderTest kayıtlarını oluştur
    const order = await this.prisma.order.create({
      data: {
        patientId,
        total,
        tests: {
          create: tests.map((testSelection) => {
            const test = testData.find((t) => t.id === testSelection.testId);
            const parameterIds = testSelection.parameterIds || 
              (test?.parameters ? test.parameters.map((p) => p.id) : []);

            return {
              testId: testSelection.testId,
              parameters: parameterIds.length > 0
                ? {
                    create: parameterIds.map((paramId) => ({
                      testParameterId: paramId,
                    })),
                  }
                : undefined,
            };
          }),
        },
      },
      include: {
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
            parameters: {
              include: {
                testParameter: true,
              },
            },
          },
        },
        patient: true,
      },
    });

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
            parameters: {
              include: {
                testParameter: true,
              },
            },
          },
        },
        patient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.order.findMany({
      where: { patientId },
      include: {
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
            parameters: {
              include: {
                testParameter: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
            parameters: {
              include: {
                testParameter: true,
              },
            },
          },
        },
        patient: true,
      },
    });
  }

  async update(id: number, updateOrderDto: CreateOrderDto) {
    const { patientId, tests } = updateOrderDto;

    // Önce mevcut order testlerini ve parametrelerini sil
    await this.prisma.orderTestParameter.deleteMany({
      where: {
        orderTest: {
          orderId: id,
        },
      },
    });
    await this.prisma.orderTest.deleteMany({
      where: { orderId: id },
    });

    // Test fiyatlarını al
    const testIds = tests.map((t) => t.testId);
    const testData = await this.prisma.test.findMany({
      where: {
        id: { in: testIds },
      },
      include: {
        parameters: true,
      },
    });

    // Toplam fiyatı hesapla
    const total = testData.reduce((sum, test) => sum + test.price, 0);

    // Order'ı güncelle
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        patientId,
        total,
        tests: {
          create: tests.map((testSelection) => {
            const test = testData.find((t) => t.id === testSelection.testId);
            const parameterIds = testSelection.parameterIds || 
              (test?.parameters ? test.parameters.map((p) => p.id) : []);

            return {
              testId: testSelection.testId,
              parameters: parameterIds.length > 0
                ? {
                    create: parameterIds.map((paramId) => ({
                      testParameterId: paramId,
                    })),
                  }
                : undefined,
            };
          }),
        },
      },
      include: {
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
            parameters: {
              include: {
                testParameter: true,
              },
            },
          },
        },
        patient: true,
      },
    });

    return order;
  }
}

