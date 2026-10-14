import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBrandSchema, updateBrandSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, brands);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
    });
    if (!brand) throw new NotFoundError('Brand not found');
    sendSuccess(res, brand);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(createBrandSchema), async (req, res, next) => {
  try {
    const brand = await prisma.brand.create({ data: req.body });
    sendSuccess(res, brand, 201, 'Brand created');
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(updateBrandSchema), async (req, res, next) => {
  try {
    const brand = await prisma.brand.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, brand, 200, 'Brand updated');
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.brand.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 200, 'Brand deleted');
  } catch (error) { next(error); }
});

export default router;
