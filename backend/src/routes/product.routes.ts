import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators';
import { sendSuccess, sendPaginated, sendError } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Role, Prisma } from '@prisma/client';

const router = Router();

const buildProductWhere = (query: Record<string, string | undefined>): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = { isActive: true };
  
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { brand: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }
  if (query.category) where.categoryId = query.category;
  if (query.brand) where.brandId = query.brand;
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }
  if (query.rating) where.averageRating = { gte: parseFloat(query.rating) };
  if (query.isNewArrival === 'true') where.isNewArrival = true;
  if (query.isBestSeller === 'true') where.isBestSeller = true;
  if (query.isFeatured === 'true') where.isFeatured = true;
  return where;
};

const buildProductOrderBy = (sort?: string): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case 'newest': return { createdAt: 'desc' };
    case 'price_asc': return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'rating': return { averageRating: 'desc' };
    case 'popular': return { totalSold: 'desc' };
    default: return { createdAt: 'desc' };
  }
};

const productInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const }, take: 5 },
  variants: { where: { isActive: true }, select: { id: true, name: true, sku: true, price: true, mrp: true, stock: true, attributes: true } },
};

router.get('/', validate(productQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = req.query as Record<string, string>;
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;
    const where = buildProductWhere(query);
    const orderBy = buildProductOrderBy(query.sort);

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: productInclude, orderBy, skip, take: limit }),
      prisma.product.count({ where }),
    ]);
    sendPaginated(res, products, total, page, limit);
  } catch (error) { next(error); }
});

router.get('/featured', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    sendSuccess(res, products);
  } catch (error) { next(error); }
});

router.get('/new-arrivals', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    sendSuccess(res, products);
  } catch (error) { next(error); }
});

router.get('/best-sellers', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: productInclude,
      orderBy: { totalSold: 'desc' },
      take: 12,
    });
    sendSuccess(res, products);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
      include: {
        ...productInclude,
        specifications: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!product) throw new NotFoundError('Product not found');
    sendSuccess(res, product);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(createProductSchema), async (req, res, next) => {
  try {
    const { variants, specifications, features, ...productData } = req.body;
    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants ? { create: variants } : undefined,
        specifications: specifications ? { create: specifications } : undefined,
        features: features ? { create: features } : undefined,
      },
      include: productInclude,
    });
    sendSuccess(res, product, 201, 'Product created');
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(updateProductSchema), async (req, res, next) => {
  try {
    const { variants, specifications, features, ...productData } = req.body;
    const { id } = req.params;
    
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }
    if (specifications) {
      await prisma.productSpecification.deleteMany({ where: { productId: id } });
    }
    if (features) {
      await prisma.productFeature.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variants ? { create: variants } : undefined,
        specifications: specifications ? { create: specifications } : undefined,
        features: features ? { create: features } : undefined,
      },
      include: productInclude,
    });
    sendSuccess(res, product, 200, 'Product updated');
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 200, 'Product archived');
  } catch (error) { next(error); }
});

export default router;
