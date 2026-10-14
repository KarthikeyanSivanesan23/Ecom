import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                variants: { where: { isActive: true } },
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, variant: true } } },
      });
    }
    sendSuccess(res, cart);
  } catch (error) { next(error); }
});

router.post('/items', requireAuth, validate(addToCartSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new NotFoundError('Product not found');

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.stock < quantity) throw new ValidationError('Insufficient stock');
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.id } });

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId || null, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    sendSuccess(res, updatedCart, 201, 'Item added to cart');
  } catch (error) { next(error); }
});

router.put('/items/:itemId', requireAuth, validate(updateCartItemSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new NotFoundError('Cart not found');

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });
    if (!cartItem) throw new NotFoundError('Cart item not found');

    if (cartItem.variant && cartItem.variant.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    sendSuccess(res, updatedCart);
  } catch (error) { next(error); }
});

router.delete('/items/:itemId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new NotFoundError('Cart not found');

    await prisma.cartItem.deleteMany({ where: { id: req.params.itemId, cartId: cart.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            variant: true,
          },
        },
      },
    });

    sendSuccess(res, updatedCart, 200, 'Item removed from cart');
  } catch (error) { next(error); }
});

router.delete('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    sendSuccess(res, null, 200, 'Cart cleared');
  } catch (error) { next(error); }
});

export default router;
