import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Roles(Role.DOCTOR, Role.ADMIN)
    @Post('process')
    @ApiOperation({ summary: 'Process a dummy payment' })
    processPayment(@Body() paymentData: any) {
        return this.paymentsService.processPayment(paymentData);
    }
}
