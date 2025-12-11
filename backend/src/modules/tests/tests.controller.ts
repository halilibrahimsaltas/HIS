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
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTION)
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTION)
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(+id, updateTestDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.testsService.remove(+id);
  }

  @Get('parameters/all')
  @Roles(Role.ADMIN, Role.RECEPTION)
  findAllParameters() {
    return this.testsService.findAllParameters();
  }
}

