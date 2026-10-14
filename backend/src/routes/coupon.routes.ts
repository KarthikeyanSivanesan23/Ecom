import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCouponSchema, validateCouponSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

router.post('/validate', requireAuth, validate(validateCouponSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await prisma.coupon.findFirst({ where: { code, isActive: true } });
    if (!coupon) throw new NotFoundError('Invalid coupon');
    if (new Date() < coupon.startDate || new Date() > coupon.expiryDate) throw new ValidationError('Coupon has expired');
    if (orderAmount < coupon.minOrderAmount) throw new ValidationError(`Minimum order amount is ₹${coupon.minOrderAmount}`);
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new ValidationError('Coupon usage limit reached');

    const userUsages = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId: req.user!.id } });
    if (userUsages >= coupon.perUserLimit) throw new ValidationError('You have reached the usage limit for this coupon');

    const discount = coupon.discountType === 'percentage'
      ? Math.min((orderAmount * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
      : Math.min(coupon.discountValue, orderAmount);

    sendSuccess(res, { discount, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, maxDiscount: coupon.maxDiscount } });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(createCouponSchema), async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    sendSuccess(res, coupon, 201, 'Coupon created');
  } catch (error) { next(error); }
});

router.get('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, coupons);
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, coupon);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 200, 'Coupon deleted');
  } catch (error) { next(error); }
});

export default router;
