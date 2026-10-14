import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import { startOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';

const router = Router();

router.use(requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    const [
      totalRevenue,
      todayRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingReturns,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: today } }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
      prisma.return.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
      prisma.product.findMany({ orderBy: { totalSold: 'desc' }, take: 5, include: { images: { where: { isPrimary: true }, take: 1 } } }),
    ]);

    sendSuccess(res, {
      totalRevenue: totalRevenue._sum.total || 0,
      todayRevenue: todayRevenue._sum.total || 0,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingReturns,
      recentOrders,
      topProducts,
    });
  } catch (error) { next(error); }
});

router.get('/customers', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const where: any = { role: 'USER' };
    if (req.query.search) {
      where.OR = [
        { email: { contains: req.query.search as string, mode: 'insensitive' } },
        { firstName: { contains: req.query.search as string, mode: 'insensitive' } },
        { lastName: { contains: req.query.search as string, mode: 'insensitive' } },
      ];
    }
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where, select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    const result = customers.map((c: any) => ({ ...c, orderCount: c._count.orders }));
    sendSuccess(res, { customers: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get('/customers/:id', async (req, res, next) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true,
        orders: { select: { id: true, orderNumber: true, total: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 },
        addresses: true,
      },
    });
    if (!customer) throw new NotFoundError('Customer not found');
    sendSuccess(res, customer);
  } catch (error) { next(error); }
});

router.put('/customers/:id/status', async (req, res, next) => {
  try {
    const customer = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
    });
    sendSuccess(res, customer);
  } catch (error) { next(error); }
});

router.get('/inventory', async (_req, res, next) => {
  try {
    const inventory = await prisma.productVariant.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, sku: true, stock: true,
        product: { select: { id: true, name: true, images: { where: { isPrimary: true }, take: 1 } } },
      },
      orderBy: { stock: 'asc' },
    });
    sendSuccess(res, inventory);
  } catch (error) { next(error); }
});

router.get('/reports/sales', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = { paymentStatus: 'PAID' };
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const orders = await prisma.order.findMany({
      where, select: { createdAt: true, total: true, items: { select: { name: true, quantity: true, total: true } } },
      orderBy: { createdAt: 'asc' },
    });
    sendSuccess(res, orders);
  } catch (error) { next(error); }
});

router.get('/returns', async (_req, res, next) => {
  try {
    const returns = await prisma.return.findMany({
      include: { order: { select: { orderNumber: true } }, user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, returns);
  } catch (error) { next(error); }
});

router.put('/returns/:id', async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const returnReq = await prisma.return.update({
      where: { id: req.params.id },
      data: { status, adminNotes },
      include: { order: true },
    });
    if (status === 'APPROVED') {
      await prisma.order.update({ where: { id: returnReq.orderId }, data: { status: 'DELIVERED' } });
    }
    sendSuccess(res, returnReq);
  } catch (error) { next(error); }
});

export default router;
