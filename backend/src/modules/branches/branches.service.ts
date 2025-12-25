import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    // Check if code already exists
    const existingBranch = await this.prisma.branch.findUnique({
      where: { code: createBranchDto.code },
    });

    if (existingBranch) {
      throw new ConflictException('Bu şube kodu zaten kullanılıyor');
    }

    return this.prisma.branch.create({
      data: createBranchDto,
    });
  }

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Şube bulunamadı');
    }

    return branch;
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Şube bulunamadı');
    }

    // Check if code is being changed and if new code already exists
    if (updateBranchDto.code && updateBranchDto.code !== branch.code) {
      const existingBranch = await this.prisma.branch.findUnique({
        where: { code: updateBranchDto.code },
      });

      if (existingBranch) {
        throw new ConflictException('Bu şube kodu zaten kullanılıyor');
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: number) {
    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Şube bulunamadı');
    }

    // Check if branch has users or orders
    if (branch._count.users > 0 || branch._count.orders > 0) {
      throw new ConflictException('Bu şubeye bağlı kullanıcılar veya siparişler var. Önce bunları kaldırın veya şubeyi pasif yapın.');
    }

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}

