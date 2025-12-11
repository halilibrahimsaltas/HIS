import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateMultipleResultsDto } from './dto/update-multiple-results.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Patch('parameter/:id')
  @Roles(Role.ADMIN, Role.LAB)
  updateResult(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
    @Request() req,
  ) {
    return this.resultsService.updateResult(+id, updateResultDto, req.user.userId);
  }

  @Post('order/:orderId')
  @Roles(Role.ADMIN, Role.LAB)
  updateMultipleResults(
    @Param('orderId') orderId: string,
    @Body() updateMultipleResultsDto: UpdateMultipleResultsDto,
    @Request() req,
  ) {
    return this.resultsService.updateMultipleResults(
      +orderId,
      updateMultipleResultsDto.results,
      req.user.userId,
    );
  }

  @Patch('parameter/:id/verify')
  @Roles(Role.ADMIN, Role.LAB)
  verifyResult(@Param('id') id: string, @Request() req) {
    return this.resultsService.verifyResult(+id, req.user.userId);
  }

  @Get('order/:orderId')
  @Roles(Role.ADMIN, Role.RECEPTION, Role.LAB)
  getOrderResults(@Param('orderId') orderId: string) {
    return this.resultsService.getOrderResults(+orderId);
  }
}

