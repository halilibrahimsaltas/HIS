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
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateDeviceMappingDto } from './dto/create-device-mapping.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LAB)
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LAB)
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }

  @Post(':id/mappings')
  @Roles(Role.ADMIN)
  addMapping(
    @Param('id') id: string,
    @Body() createMappingDto: CreateDeviceMappingDto,
  ) {
    return this.devicesService.addMapping(+id, createMappingDto);
  }

  @Get(':id/mappings')
  @Roles(Role.ADMIN, Role.LAB)
  getMappings(@Param('id') id: string) {
    return this.devicesService.getMappings(+id);
  }

  @Delete('mappings/:mappingId')
  @Roles(Role.ADMIN)
  removeMapping(@Param('mappingId') mappingId: string) {
    return this.devicesService.removeMapping(+mappingId);
  }

  @Get('queue/all')
  @Roles(Role.ADMIN, Role.LAB)
  getQueue() {
    return this.devicesService.getQueue();
  }

  @Get('queue/device/:deviceId')
  @Roles(Role.ADMIN, Role.LAB)
  getQueueByDevice(@Param('deviceId') deviceId: string) {
    return this.devicesService.getQueue(+deviceId);
  }

  @Post('queue/:queueId/retry')
  @Roles(Role.ADMIN, Role.LAB)
  retryProcessing(@Param('queueId') queueId: string) {
    return this.devicesService.retryProcessing(+queueId);
  }
}

