import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TestParametersService } from './test-parameters.service';
import { CreateTestParameterDto } from './dto/create-test-parameter.dto';
import { UpdateTestParameterDto } from './dto/update-test-parameter.dto';
import { CreateReferenceRangeDto } from './dto/create-reference-range.dto';
import { UpdateReferenceRangeDto } from './dto/update-reference-range.dto';
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
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
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

  // Reference Range Endpoints
  @Post(':id/reference-ranges')
  @Roles(Role.ADMIN)
  addReferenceRange(
    @Param('id') id: string,
    @Body() createReferenceRangeDto: CreateReferenceRangeDto,
  ) {
    return this.testParametersService.addReferenceRange(+id, createReferenceRangeDto);
  }

  @Get(':id/reference-ranges')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  getReferenceRanges(@Param('id') id: string) {
    return this.testParametersService.getReferenceRanges(+id);
  }

  @Patch('reference-ranges/:rangeId')
  @Roles(Role.ADMIN)
  updateReferenceRange(
    @Param('rangeId') rangeId: string,
    @Body() updateReferenceRangeDto: UpdateReferenceRangeDto,
  ) {
    return this.testParametersService.updateReferenceRange(+rangeId, updateReferenceRangeDto);
  }

  @Delete('reference-ranges/:rangeId')
  @Roles(Role.ADMIN)
  removeReferenceRange(@Param('rangeId') rangeId: string) {
    return this.testParametersService.removeReferenceRange(+rangeId);
  }

  @Get(':id/reference-range')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  getReferenceRangeForPatient(
    @Param('id') id: string,
    @Query('age') age: string,
    @Query('gender') gender: string,
  ) {
    return this.testParametersService.getReferenceRangeForPatient(+id, +age, gender);
  }
}

