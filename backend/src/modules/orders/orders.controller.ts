import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTION)
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.RECEPTION)
  update(@Param('id') id: string, @Body() updateOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.update(+id, updateOrderDto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTION)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.RECEPTION)
  findByPatient(@Param('patientId') patientId: string) {
    return this.ordersService.findByPatient(+patientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post(':id/accept-sample')
  @Roles(Role.ADMIN, Role.LAB)
  acceptSample(@Param('id') id: string, @Request() req) {
    return this.ordersService.acceptSample(+id, req.user.userId);
  }

  @Patch(':id/sample-status')
  @Roles(Role.ADMIN, Role.LAB)
  updateSampleStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateSampleStatus(+id, body.status);
  }

  @Get('barcode/:barcode')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  findByBarcode(@Param('barcode') barcode: string) {
    return this.ordersService.findByBarcode(barcode);
  }

  @Get('order-test/barcode/:barcode')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  findOrderTestByBarcode(@Param('barcode') barcode: string) {
    return this.ordersService.findOrderTestByBarcode(barcode);
  }
}

