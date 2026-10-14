import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './index';

let razorpay: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpay;
};

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  const instance = getRazorpayInstance();
  const order = await instance.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
  return order;
};

export const verifyRazorpayPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
};

export const createRefund = async (paymentId: string, amount?: number) => {
  const instance = getRazorpayInstance();
  const refund = await instance.payments.refund(paymentId, {
    amount: amount ? Math.round(amount * 100) : undefined,
  });
  return refund;
};
