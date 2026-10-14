import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role, OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const generateOrderNumber = () => {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
};

router.post('/', requireAuth, validate(createOrderSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { addressId, paymentMethod, couponCode, notes } = req.body;
    const userId = req.user!.id;

    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundError('Address not found');

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) throw new ValidationError('Cart is empty');

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant ? item.variant.sku : item.product.sku,
        price,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
      });
      if (!coupon) throw new NotFoundError('Invalid coupon');
      if (new Date() < coupon.startDate || new Date() > coupon.expiryDate) {
        throw new ValidationError('Coupon is expired');
      }
      if (subtotal < coupon.minOrderAmount) {
        throw new ValidationError(`Minimum order amount is ${coupon.minOrderAmount}`);
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new ValidationError('Coupon usage limit reached');
      }
      couponDiscount = coupon.discountType === 'percentage'
        ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
        : coupon.discountValue;
    }

    const shippingCharge = subtotal >= 999 ? 0 : 99;
    const tax = ((subtotal - couponDiscount) * 18) / 100;
    const total = subtotal - couponDiscount + shippingCharge + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        subtotal,
        discount: 0,
        shippingCharge,
        tax,
        couponDiscount,
        total,
        paymentMethod,
        notes,
        items: { create: orderItems },
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      },
      include: { items: true, address: true },
    });

    for (const item of cart.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { totalSold: { increment: item.quantity } },
      });
    }

    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    sendSuccess(res, order, 201, 'Order placed successfully');
  } catch (error) { next(error); }
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: { items: true, address: true },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.order.count({ where: { userId: req.user!.id } }),
    ]);
    sendPaginated(res, orders, total, page, limit);
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { items: true, address: true, payments: true, returns: true },
    });
    if (!order) throw new NotFoundError('Order not found');
    sendSuccess(res, order);
  } catch (error) { next(error); }
});

router.put('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!order) throw new NotFoundError('Order not found');
    
    const nonCancellable = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;
    if (nonCancellable.includes(order.status as any)) {
      throw new ValidationError('Order cannot be cancelled at this stage');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date(), cancelReason: req.body.reason || 'Customer cancelled' },
      include: { items: true },
    });

    for (const item of updated.items) {
      if (item.variantId) {
        await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      }
      await prisma.product.update({ where: { id: item.productId }, data: { totalSold: { decrement: item.quantity } } });
    }

    sendSuccess(res, updated, 200, 'Order cancelled');
  } catch (error) { next(error); }
});

router.post('/:id/return', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new ValidationError('Return can only be requested for delivered orders');
    }
    const returnRequest = await prisma.return.create({
      data: { orderId: order.id, userId: req.user!.id, reason: req.body.reason, description: req.body.description, images: req.body.images || [] },
    });
    sendSuccess(res, returnRequest, 201, 'Return request submitted');
  } catch (error) { next(error); }
});

router.get('/admin/all', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) {
      where.OR = [
        { orderNumber: { contains: req.query.search as string, mode: 'insensitive' } },
        { user: { email: { contains: req.query.search as string, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, include: { items: true, address: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    sendPaginated(res, orders, total, page, limit);
  } catch (error) { next(error); }
});

router.put('/admin/:id/status', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const { status, trackingNumber, shippingCarrier, cancelReason } = req.body;
    const data: any = { status };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (shippingCarrier) data.shippingCarrier = shippingCarrier;
    if (cancelReason) data.cancelReason = cancelReason;
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    if (status === 'CANCELLED') data.cancelledAt = new Date();

    const order = await prisma.order.update({ where: { id: req.params.id }, data, include: { items: true, address: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } } });
    sendSuccess(res, order, 200, 'Order status updated');
  } catch (error) { next(error); }
});

export default router;
