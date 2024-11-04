import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { PaymentRepository } from './payment.repository';
import { UserModule } from '../user/user.module'; // Adjust the path as needed
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => UserModule), // Use forwardRef here
  ],
  controllers:[PaymentController],
  providers: [PaymentService, PaymentRepository,],
  exports: [PaymentService],
})
export class PaymentModule {}
