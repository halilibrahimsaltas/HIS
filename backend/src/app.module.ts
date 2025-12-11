import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { TestsModule } from './modules/tests/tests.module';
import { TestParametersModule } from './modules/test-parameters/test-parameters.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ResultsModule } from './modules/results/results.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    TestsModule,
    TestParametersModule,
    OrdersModule,
    ResultsModule,
  ],
})
export class AppModule {}

