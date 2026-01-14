import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private productsService: ProductsService,
        private stripeService: StripeService,
    ) { }

    async create(createOrderDto: CreateOrderDto, user: any): Promise<any> {
        const product = await this.productsService.findOne(createOrderDto.productId);

        const newOrder = new this.orderModel({
            user: new Types.ObjectId(user._id as string),
            product: product._id, // Use as is, or cast if needed
            amount: product.price,
            status: 'pending',
        });

        const order = await newOrder.save();

        const session = await this.stripeService.createCheckoutSession({
            amount: order.amount,
            productName: product.name,
            orderId: order._id.toString(),
            customerEmail: user.email,
        });

        order.stripeSessionId = session.id;
        await order.save();

        return {
            order,
            checkoutUrl: session.url,
        };
    }

    async findAllByUser(userId: string): Promise<OrderDocument[]> {
        return this.orderModel.find({ user: new Types.ObjectId(userId) } as any).populate('product').exec();
    }

    async updateStatus(orderId: string, status: string, paymentIntentId?: string) {
        const updateData: any = { status };
        if (paymentIntentId) {
            updateData.stripePaymentIntentId = paymentIntentId;
        }
        return this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
    }

    async findBySessionId(sessionId: string): Promise<OrderDocument | null> {
        return this.orderModel.findOne({ stripeSessionId: sessionId }).exec();
    }
}
