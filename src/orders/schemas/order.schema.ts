import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
    product: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ default: 'pending' })
    status: string; // pending, completed, failed

    @Prop()
    stripeSessionId: string;

    @Prop()
    stripePaymentIntentId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
