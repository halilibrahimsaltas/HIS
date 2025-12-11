import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateResultDto } from './dto/update-result.dto';
import { ResultItemDto } from './dto/update-multiple-results.dto';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async updateResult(orderTestParameterId: number, updateResultDto: UpdateResultDto, userId: number) {
    return this.prisma.orderTestParameter.update({
      where: { id: orderTestParameterId },
      data: {
        result: updateResultDto.result,
        status: updateResultDto.status || 'ENTERED',
        enteredAt: new Date(),
        enteredBy: userId,
      },
      include: {
        testParameter: true,
        orderTest: {
          include: {
            test: true,
            order: {
              include: {
                patient: true,
              },
            },
          },
        },
        enteredByUser: true,
      },
    });
  }

  async updateMultipleResults(orderId: number, results: ResultItemDto[], userId: number) {
    const updates = results.map((result) =>
      this.prisma.orderTestParameter.update({
        where: { id: result.orderTestParameterId },
        data: {
          result: result.result,
          status: result.status || 'ENTERED',
          enteredAt: new Date(),
          enteredBy: userId,
        },
      })
    );

    await Promise.all(updates);

    return this.prisma.order.findUnique({
      where: { id: orderId },
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
      },
    });
  }

  async verifyResult(orderTestParameterId: number, userId: number) {
    return this.prisma.orderTestParameter.update({
      where: { id: orderTestParameterId },
      data: {
        status: 'VERIFIED',
        enteredBy: userId,
      },
      include: {
        testParameter: true,
        orderTest: {
          include: {
            test: true,
            order: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });
  }

  async getOrderResults(orderId: number) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
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
}

