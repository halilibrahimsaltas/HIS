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
import { TestParametersService } from './test-parameters.service';
import { CreateTestParameterDto } from './dto/create-test-parameter.dto';
import { UpdateTestParameterDto } from './dto/update-test-parameter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('test-parameters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestParametersController {
  constructor(private readonly testParametersService: TestParametersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTestParameterDto: CreateTestParameterDto) {
    return this.testParametersService.create(createTestParameterDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTION)
  findAll() {
    return this.testParametersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTION)
  findOne(@Param('id') id: string) {
    return this.testParametersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateTestParameterDto: UpdateTestParameterDto) {
    return this.testParametersService.update(+id, updateTestParameterDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.testParametersService.remove(+id);
  }
}

