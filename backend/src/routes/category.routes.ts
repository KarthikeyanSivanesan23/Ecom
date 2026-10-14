import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: { where: { isActive: true } },
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    sendSuccess(res, categories);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!category) throw new NotFoundError('Category not found');
    sendSuccess(res, category);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(createCategorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    sendSuccess(res, category, 201, 'Category created');
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(updateCategorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, category, 200, 'Category updated');
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 200, 'Category deleted');
  } catch (error) { next(error); }
});

export default router;
