import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DeviceConnectionService } from './device-connection.service';
import { AstmParserService } from './parsers/astm-parser.service';
import { Hl7ParserService } from './parsers/hl7-parser.service';
import { ResultProcessorService } from './result-processor.service';
import { DeviceQueueProcessor } from './device-queue.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'device-results',
    }),
  ],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    DeviceConnectionService,
    AstmParserService,
    Hl7ParserService,
    ResultProcessorService,
    DeviceQueueProcessor,
  ],
  exports: [DevicesService, DeviceConnectionService],
})
export class DevicesModule {}

