import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AstmParserService } from './parsers/astm-parser.service';
import { Hl7ParserService } from './parsers/hl7-parser.service';
import { DeviceProtocol } from '@prisma/client';

@Injectable()
export class ResultProcessorService {
  private readonly logger = new Logger(ResultProcessorService.name);

  constructor(
    private prisma: PrismaService,
    private astmParser: AstmParserService,
    private hl7Parser: Hl7ParserService,
  ) {}

  async processResult(queueId: number) {
    const queueItem = await this.prisma.deviceResultQueue.findUnique({
      where: { id: queueId },
      include: {
        device: {
          include: {
            mappings: {
              include: {
                testParameter: true,
              },
            },
          },
        },
      },
    });

    if (!queueItem) {
      throw new Error('Queue item bulunamadı');
    }

    try {
      // Parse et
      let parsedResults: any[] = [];
      if (queueItem.device.protocol === DeviceProtocol.ASTM) {
        parsedResults = this.astmParser.parseMessage(queueItem.rawMessage);
      } else if (queueItem.device.protocol === DeviceProtocol.HL7) {
        parsedResults = this.hl7Parser.parseMessage(queueItem.rawMessage);
      } else {
        throw new Error('Desteklenmeyen protokol');
      }

      if (parsedResults.length === 0) {
        throw new Error('Parse edilebilir sonuç bulunamadı');
      }

      // Parse edilmiş veriyi kaydet
      await this.prisma.deviceResultQueue.update({
        where: { id: queueId },
        data: {
          parsedData: parsedResults as any,
          status: 'PROCESSING',
        },
      });

      // Her bir sonuç için işle
      for (const parsedResult of parsedResults) {
        await this.processSingleResult(queueId, parsedResult, queueItem.device);
      }

      // İşleme tamamlandı
      await this.prisma.deviceResultQueue.update({
        where: { id: queueId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      this.logger.log(`Queue item ${queueId} başarıyla işlendi`);
    } catch (error) {
      this.logger.error(`Queue item ${queueId} işleme hatası: ${error.message}`);
      await this.prisma.deviceResultQueue.update({
        where: { id: queueId },
        data: {
          status: 'ERROR',
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  private async processSingleResult(
    queueId: number,
    parsedResult: any,
    device: any,
  ) {
    // Test kodunu eşleştir
    const mapping = device.mappings.find(
      (m: any) => m.deviceTestCode === parsedResult.testCode,
    );

    if (!mapping) {
      this.logger.warn(
        `Cihaz ${device.id} için test kodu eşleşmesi bulunamadı: ${parsedResult.testCode}`,
      );
      return;
    }

    // Barkod ile OrderTest veya Order bul
    let order = null;
    let orderTest = null;
    
    if (parsedResult.barcode) {
      // Önce OrderTest'te ara (her test için ayrı barkod)
      orderTest = await this.prisma.orderTest.findUnique({
        where: { barcode: parsedResult.barcode },
        include: {
          order: {
            include: {
              patient: true,
            },
          },
          test: true,
          parameters: {
            include: {
              testParameter: true,
            },
          },
        },
      });

      if (orderTest) {
        order = orderTest.order;
      } else {
        // Eğer OrderTest'te bulunamazsa Order'da ara (geriye dönük uyumluluk)
        order = await this.prisma.order.findUnique({
          where: { barcode: parsedResult.barcode },
          include: {
            tests: {
              include: {
                parameters: {
                  include: {
                    testParameter: true,
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!order) {
      this.logger.warn(
        `Barkod ile order/orderTest bulunamadı: ${parsedResult.barcode || 'N/A'}`,
      );
      // Manuel inceleme için işaretle
      await this.prisma.deviceResultQueue.update({
        where: { id: queueId },
        data: {
          status: 'MANUAL_REVIEW',
          errorMessage: 'Order/OrderTest bulunamadı - manuel eşleştirme gerekli',
        },
      });
      return;
    }

    // OrderTestParameter bul
    let orderTestParameter = null;
    
    if (orderTest) {
      // OrderTest'ten direkt parametre bul
      orderTestParameter = orderTest.parameters.find(
        (otp) => otp.testParameterId === mapping.testParameterId,
      );
    } else {
      // Order'dan tüm testlerde ara
      orderTestParameter = order.tests
        .flatMap((ot) => ot.parameters || [])
        .find(
          (otp) => otp.testParameterId === mapping.testParameterId,
        );
    }

    if (!orderTestParameter) {
      this.logger.warn(
        `Order ${order.id}${orderTest ? `, OrderTest ${orderTest.id}` : ''} için test parametresi bulunamadı: ${mapping.testParameterId}`,
      );
      return;
    }

    // Sonucu kaydet
    await this.prisma.orderTestParameter.update({
      where: { id: orderTestParameter.id },
      data: {
        result: parsedResult.result,
        status: 'ENTERED',
        enteredAt: new Date(),
      },
    });

    // Queue item'ı order ve orderTest ile ilişkilendir
    await this.prisma.deviceResultQueue.update({
      where: { id: queueId },
      data: {
        orderId: order.id,
        orderTestId: orderTest?.id || null,
        patientId: order.patientId,
        barcode: parsedResult.barcode,
        testCode: parsedResult.testCode,
        result: parsedResult.result,
        unit: parsedResult.unit,
      },
    });

    this.logger.log(
      `Sonuç kaydedildi: Order ${order.id}, Parametre ${orderTestParameter.id}, Sonuç: ${parsedResult.result}`,
    );
  }
}

