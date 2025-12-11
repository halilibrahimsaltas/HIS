import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.RECEPTION)
  update(@Param('id') id: string, @Body() updateOrderDto: CreateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
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
  @Roles(Role.ADMIN, Role.RECEPTION)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }
}

