import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB, Role.CHIEF_PHYSICIAN)
  findAll() {
    return this.branchesService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB, Role.CHIEF_PHYSICIAN)
  findActive() {
    return this.branchesService.findActive();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB, Role.CHIEF_PHYSICIAN)
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(+id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.branchesService.remove(+id);
  }
}

