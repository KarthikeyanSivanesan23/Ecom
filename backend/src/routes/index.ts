import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import couponRoutes from './coupon.routes';
import addressRoutes from './address.routes';
import bannerRoutes from './banner.routes';
import adminRoutes from './admin.routes';
import nodaRoutes from './noda.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/addresses', addressRoutes);
router.use('/banners', bannerRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/noda', nodaRoutes);

export default router;
