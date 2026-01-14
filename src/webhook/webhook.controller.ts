import { Controller, Post, Headers, Request, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../stripe/stripe.service';
import type { Request as ExpressRequest } from 'express';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
    ) { }

    @Post()
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Request() req: RawBodyRequest<ExpressRequest>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }

        let event;

        try {
            event = await this.stripeService.constructEvent(
                req.rawBody as Buffer,
                signature,
                webhookSecret,
            );
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await this.handleCheckoutSessionCompleted(session);
                break;
            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object;
                await this.handlePaymentFailed(paymentIntent);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    private async handleCheckoutSessionCompleted(session: any) {
        const orderId = session.metadata.orderId;
        const paymentIntentId = session.payment_intent;
        await this.ordersService.updateStatus(orderId, 'completed', paymentIntentId);
        console.log(`Order ${orderId} completed successfully`);
    }

    private async handlePaymentFailed(paymentIntent: any) {
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
            await this.ordersService.updateStatus(orderId, 'failed');
        }
        console.log(`Payment failed for order ${orderId}`);
    }
}
