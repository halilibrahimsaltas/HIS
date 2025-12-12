import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ResultProcessorService } from './result-processor.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Processor('device-results')
export class DeviceQueueProcessor {
  private readonly logger = new Logger(DeviceQueueProcessor.name);

  constructor(
    private resultProcessor: ResultProcessorService,
    private prisma: PrismaService,
  ) {}

  @Process('process-result')
  async handleProcessResult(job: Job) {
    const { queueId, deviceId, rawMessage } = job.data;

    this.logger.log(`İşleniyor: Queue ID ${queueId}, Cihaz ${deviceId}`);

    // Queue item'ı bul
    let queueItem = await this.prisma.deviceResultQueue.findUnique({
      where: { id: queueId },
    });

    // Eğer queueId ile bulunamazsa, eski yöntemle dene
    if (!queueItem) {
      queueItem = await this.prisma.deviceResultQueue.findFirst({
        where: {
          deviceId,
          rawMessage,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!queueItem) {
      this.logger.warn('Queue item bulunamadı');
      return;
    }

    await this.resultProcessor.processResult(queueItem.id);
  }
}

