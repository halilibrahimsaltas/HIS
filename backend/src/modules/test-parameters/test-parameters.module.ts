import { Module } from '@nestjs/common';
import { TestParametersController } from './test-parameters.controller';
import { TestParametersService } from './test-parameters.service';

@Module({
  controllers: [TestParametersController],
  providers: [TestParametersService],
  exports: [TestParametersService],
})
export class TestParametersModule {}

