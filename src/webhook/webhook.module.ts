import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { OrdersModule } from '../orders/orders.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [OrdersModule, StripeModule],
  controllers: [WebhookController],
})
export class WebhookModule { }
