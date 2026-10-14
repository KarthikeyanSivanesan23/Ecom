import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, isApproved: true },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, reviews);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, validate(createReviewSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const orderItem = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user!.id, status: 'DELIVERED' } },
    });

    const existing = await prisma.review.findFirst({ where: { productId, userId: req.user!.id } });
    if (existing) throw new ForbiddenError('You have already reviewed this product');

    const review = await prisma.review.create({
      data: { productId, userId: req.user!.id, rating, title, comment, isVerified: !!orderItem, isApproved: false },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    const stats = await prisma.review.aggregate({ where: { productId, isApproved: true }, _avg: { rating: true }, _count: true });
    await prisma.product.update({
      where: { id: productId },
      data: { averageRating: stats._avg.rating || 0, reviewCount: stats._count },
    });

    sendSuccess(res, review, 201, 'Review submitted for approval');
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review not found');
    if (review.userId !== req.user!.id) throw new ForbiddenError('Not your review');

    const updated = await prisma.review.update({ where: { id: req.params.id }, data: { ...req.body, isApproved: false } });
    sendSuccess(res, updated);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new NotFoundError('Review not found');
    if (review.userId !== req.user!.id) throw new ForbiddenError('Not your review');
    await prisma.review.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 200, 'Review deleted');
  } catch (error) { next(error); }
});

router.put('/admin/:id/approve', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { isApproved: true } });
    const stats = await prisma.review.aggregate({ where: { productId: review.productId, isApproved: true }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: review.productId }, data: { averageRating: stats._avg.rating || 0, reviewCount: stats._count } });
    sendSuccess(res, review, 200, 'Review approved');
  } catch (error) { next(error); }
});

export default router;
