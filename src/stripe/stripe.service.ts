import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async createCheckoutSession(params: {
        amount: number;
        productName: string;
        orderId: string;
        customerEmail: string;
    }) {
        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: params.productName,
                        },
                        unit_amount: Math.round(params.amount * 100), // Ensure it's an integer
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${this.configService.get<string>('APP_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.configService.get<string>('APP_URL')}/cancel`,
            customer_email: params.customerEmail,
            metadata: {
                orderId: params.orderId,
            },
        });
    }

    async constructEvent(body: Buffer, signature: string, secret: string) {
        return this.stripe.webhooks.constructEvent(body, signature, secret);
    }
}
