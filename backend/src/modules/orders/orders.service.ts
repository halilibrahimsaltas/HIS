import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Artık generateBarcode kullanmıyoruz, sadece OrderTest ID kullanıyoruz
  // Bu fonksiyon geriye dönük uyumluluk için acceptSample'da kullanılabilir
  private generateBarcode(orderId: number, testId: number, index: number): string {
    // Eski format - artık kullanılmıyor, sadece acceptSample'da fallback olarak
    const timestamp = Date.now().toString().slice(-8);
    return `OT-${orderId}-${testId}-${timestamp}-${index}`;
  }

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

    // Order oluştur
    const order = await this.prisma.order.create({
      data: {
        patientId,
        total,
      },
    });

    // OrderTest kayıtlarını oluştur ve barkod olarak ID'yi ata
    const orderTests = await Promise.all(
      tests.map(async (testSelection, index) => {
        const test = testData.find((t) => t.id === testSelection.testId);
        const parameterIds = testSelection.parameterIds || 
          (test?.parameters ? test.parameters.map((p) => p.id) : []);

        // Önce OrderTest'i oluştur (barkod olmadan)
        const orderTest = await this.prisma.orderTest.create({
          data: {
            orderId: order.id,
            testId: testSelection.testId,
            parameters: parameterIds.length > 0
              ? {
                  create: parameterIds.map((paramId) => ({
                    testParameterId: paramId,
                  })),
                }
              : undefined,
          },
        });

        // Oluşturulan ID'yi barkod olarak güncelle
        const updatedOrderTest = await this.prisma.orderTest.update({
          where: { id: orderTest.id },
          data: {
            barcode: orderTest.id.toString(),
          },
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
        });

        return updatedOrderTest;
      })
    );

    // Order'ı tekrar al ve testleri dahil et
    return this.prisma.order.findUnique({
      where: { id: order.id },
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
        acceptedByUser: true,
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
                enteredByUser: true,
              },
            },
          },
        },
        patient: true,
        acceptedByUser: true,
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
    await this.prisma.order.update({
      where: { id },
      data: {
        patientId,
        total,
      },
    });

    // OrderTest kayıtlarını oluştur ve barkod olarak ID'yi ata
    await Promise.all(
      tests.map(async (testSelection, index) => {
        const test = testData.find((t) => t.id === testSelection.testId);
        const parameterIds = testSelection.parameterIds || 
          (test?.parameters ? test.parameters.map((p) => p.id) : []);

        // Önce OrderTest'i oluştur (barkod olmadan)
        const orderTest = await this.prisma.orderTest.create({
          data: {
            orderId: id,
            testId: testSelection.testId,
            parameters: parameterIds.length > 0
              ? {
                  create: parameterIds.map((paramId) => ({
                      testParameterId: paramId,
                    })),
                  }
              : undefined,
          },
        });

        // Oluşturulan ID'yi barkod olarak güncelle
        await this.prisma.orderTest.update({
          where: { id: orderTest.id },
          data: {
            barcode: orderTest.id.toString(),
          },
        });
      })
    );

    // Order'ı tekrar al ve testleri dahil et
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

  async acceptSample(orderId: number, userId: number) {
    // Order'ı al ve testlerini kontrol et
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tests: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order bulunamadı');
    }

    // Eğer OrderTest'lerde barkod yoksa ID'yi barkod olarak ata
    const orderTestsWithoutBarcode = order.tests.filter((ot) => !ot.barcode);
    if (orderTestsWithoutBarcode.length > 0) {
      await Promise.all(
        orderTestsWithoutBarcode.map(async (orderTest) => {
          await this.prisma.orderTest.update({
            where: { id: orderTest.id },
            data: {
              barcode: orderTest.id.toString(),
            },
          });
        })
      );
    }

    // Order için de barkod oluştur (geriye dönük uyumluluk için)
    const orderBarcode = order.barcode || `ORD-${orderId}-${Date.now()}`;

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        barcode: orderBarcode,
        sampleStatus: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedBy: userId,
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
        acceptedByUser: true,
      },
    });
  }

  async updateSampleStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        sampleStatus: status as any,
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
  }

  async findByBarcode(barcode: string) {
    // Önce OrderTest'te ara
    const orderTest = await this.prisma.orderTest.findUnique({
      where: { barcode },
      include: {
        order: {
          include: {
            patient: true,
            acceptedByUser: true,
          },
        },
        test: {
          include: {
            parameters: true,
          },
        },
        parameters: {
          include: {
            testParameter: true,
            enteredByUser: true,
          },
        },
      },
    });

    if (orderTest) {
      return {
        type: 'orderTest',
        orderTest,
        order: orderTest.order,
      };
    }

    // Eğer OrderTest'te bulunamazsa Order'da ara (geriye dönük uyumluluk için)
    const order = await this.prisma.order.findUnique({
      where: { barcode },
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
                enteredByUser: true,
              },
            },
          },
        },
        patient: true,
        acceptedByUser: true,
      },
    });

    if (order) {
      return {
        type: 'order',
        order,
      };
    }

    return null;
  }

  async findOrderTestByBarcode(barcode: string) {
    return this.prisma.orderTest.findUnique({
      where: { barcode },
      include: {
        order: {
          include: {
            patient: true,
            acceptedByUser: true,
          },
        },
        test: {
          include: {
            parameters: true,
          },
        },
        parameters: {
          include: {
            testParameter: true,
            enteredByUser: true,
          },
        },
      },
    });
  }
}

