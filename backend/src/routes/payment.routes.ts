import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { createRazorpayOrder, verifyRazorpayPayment, createRefund } from '../config/razorpay';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { NotFoundError, ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

router.post('/create-order', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user!.id } });
    if (!order) throw new NotFoundError('Order not found');

    const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        method: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
      },
    });

    sendSuccess(res, {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) { next(error); }
});

router.post('/verify', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return sendError(res, 400, 'Payment verification failed', 'PAYMENT_FAILED');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    await prisma.payment.updateMany({
      where: { orderId, razorpayOrderId },
      data: {
        status: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    sendSuccess(res, null, 200, 'Payment verified successfully');
  } catch (error) { next(error); }
});

router.post('/refund', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found');
    if (!order.razorpayPaymentId) throw new ValidationError('No payment to refund');

    const refund = await createRefund(order.razorpayPaymentId, amount);

    await prisma.refund.create({
      data: {
        orderId,
        amount: amount || order.total,
        status: 'PROCESSED',
        razorpayRefundId: refund.id,
      },
    });

    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'REFUNDED' } });

    sendSuccess(res, refund, 200, 'Refund processed');
  } catch (error) { next(error); }
});

export default router;
