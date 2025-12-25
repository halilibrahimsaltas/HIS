import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyReportByBranch(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Tüm şubeleri al
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            tests: true,
          },
        },
      },
    });

    // Her şube için istatistikleri hesapla
    const branchStats = branches.map((branch) => {
      let totalTests = 0;
      let totalRevenue = 0;

      branch.orders.forEach((order) => {
        totalTests += order.tests.length;
        totalRevenue += order.total;
      });

      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        totalOrders: branch.orders.length,
        totalTests,
        totalRevenue,
      };
    });

    // Şube olmayan siparişler için de istatistik
    const ordersWithoutBranch = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        branchId: null,
      },
      include: {
        tests: true,
      },
    });

    let totalTestsWithoutBranch = 0;
    let totalRevenueWithoutBranch = 0;

    ordersWithoutBranch.forEach((order) => {
      totalTestsWithoutBranch += order.tests.length;
      totalRevenueWithoutBranch += order.total;
    });

    if (ordersWithoutBranch.length > 0) {
      branchStats.push({
        branchId: null,
        branchName: 'Şube Atanmamış',
        branchCode: '-',
        totalOrders: ordersWithoutBranch.length,
        totalTests: totalTestsWithoutBranch,
        totalRevenue: totalRevenueWithoutBranch,
      });
    }

    return {
      date: date.toISOString().split('T')[0],
      branchStats,
      total: {
        totalOrders: branchStats.reduce((sum, stat) => sum + stat.totalOrders, 0),
        totalTests: branchStats.reduce((sum, stat) => sum + stat.totalTests, 0),
        totalRevenue: branchStats.reduce((sum, stat) => sum + stat.totalRevenue, 0),
      },
    };
  }

  async getDailyReportByDateRange(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Tüm şubeleri al
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          include: {
            tests: true,
          },
        },
      },
    });

    // Her şube için istatistikleri hesapla
    const branchStats = branches.map((branch) => {
      let totalTests = 0;
      let totalRevenue = 0;

      branch.orders.forEach((order) => {
        totalTests += order.tests.length;
        totalRevenue += order.total;
      });

      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        totalOrders: branch.orders.length,
        totalTests,
        totalRevenue,
      };
    });

    // Şube olmayan siparişler için de istatistik
    const ordersWithoutBranch = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        branchId: null,
      },
      include: {
        tests: true,
      },
    });

    let totalTestsWithoutBranch = 0;
    let totalRevenueWithoutBranch = 0;

    ordersWithoutBranch.forEach((order) => {
      totalTestsWithoutBranch += order.tests.length;
      totalRevenueWithoutBranch += order.total;
    });

    if (ordersWithoutBranch.length > 0) {
      branchStats.push({
        branchId: null,
        branchName: 'Şube Atanmamış',
        branchCode: '-',
        totalOrders: ordersWithoutBranch.length,
        totalTests: totalTestsWithoutBranch,
        totalRevenue: totalRevenueWithoutBranch,
      });
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      branchStats,
      total: {
        totalOrders: branchStats.reduce((sum, stat) => sum + stat.totalOrders, 0),
        totalTests: branchStats.reduce((sum, stat) => sum + stat.totalTests, 0),
        totalRevenue: branchStats.reduce((sum, stat) => sum + stat.totalRevenue, 0),
      },
    };
  }
}

