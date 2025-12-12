import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { TestsModule } from './modules/tests/tests.module';
import { TestParametersModule } from './modules/test-parameters/test-parameters.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ResultsModule } from './modules/results/results.module';
import { DevicesModule } from './modules/devices/devices.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    TestsModule,
    TestParametersModule,
    OrdersModule,
    ResultsModule,
    DevicesModule,
  ],
})
export class AppModule {}

