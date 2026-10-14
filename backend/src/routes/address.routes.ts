import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAddressSchema, updateAddressSchema } from '../validators';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    sendSuccess(res, addresses);
  } catch (error) { next(error); }
});

router.post('/', requireAuth, validate(createAddressSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { ...req.body, userId: req.user!.id },
    });
    sendSuccess(res, address, 201);
  } catch (error) { next(error); }
});

router.put('/:id', requireAuth, validate(updateAddressSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({
      where: { id, userId: req.user!.id },
      data: req.body,
    });
    sendSuccess(res, address);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id, userId: req.user!.id } });
    sendSuccess(res, null, 200, 'Address deleted');
  } catch (error) { next(error); }
});

router.put('/:id/default', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    const address = await prisma.address.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isDefault: true },
    });
    sendSuccess(res, address);
  } catch (error) { next(error); }
});

export default router;
