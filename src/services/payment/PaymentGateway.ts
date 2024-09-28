import { PaymobPayment } from './paymob.service';
import { StripePayment } from './stripe.service';

export class PaymentGateway {
    static async createPayment({ amount, paymentId, userId, paymentMethod }) {
        switch (paymentMethod) {
            case 'stripe':
                return await StripePayment.createPayment({ amount, paymentId, userId });
            case 'paymob':
                return await PaymobPayment.createPayment({ amount, paymentId, userId });
            default:
                throw new Error("Invalid payment method");
        }
    }

 
}