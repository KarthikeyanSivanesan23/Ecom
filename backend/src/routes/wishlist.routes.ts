import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                variants: { where: { isActive: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
      });
    }
    sendSuccess(res, wishlist);
  } catch (error) { next(error); }
});

router.post('/:productId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product not found');

    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: req.user!.id } });

    const existing = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existing) {
      return sendSuccess(res, null, 200, 'Already in wishlist');
    }

    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    sendSuccess(res, null, 201, 'Added to wishlist');
  } catch (error) { next(error); }
});

router.delete('/:productId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) throw new NotFoundError('Wishlist not found');

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId: req.params.productId },
    });
    sendSuccess(res, null, 200, 'Removed from wishlist');
  } catch (error) { next(error); }
});

export default router;
