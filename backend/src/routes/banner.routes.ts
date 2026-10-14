import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBannerSchema, updateBannerSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    sendSuccess(res, banners);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(createBannerSchema), async (req, res, next) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    sendSuccess(res, banner, 201, 'Banner created');
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), validate(updateBannerSchema), async (req, res, next) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, banner);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 200, 'Banner deleted');
  } catch (error) { next(error); }
});

export default router;
