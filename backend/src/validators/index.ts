import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const createAddressSchema = z.object({
  label: z.string().default('Home'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().default('India'),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

const productVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  mrp: z.number().positive(),
  stock: z.number().int().min(0),
  attributes: z.record(z.string()).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  price: z.number().positive(),
  mrp: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(18),
  weight: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
  specifications: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  rating: z.string().optional(),
  sort: z.string().optional(),
  isNewArrival: z.string().optional(),
  isBestSeller: z.string().optional(),
  isFeatured: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'BANK_TRANSFER']).default('RAZORPAY'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  startDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  applicableProductIds: z.array(z.string().uuid()).optional(),
  applicableCategoryIds: z.array(z.string().uuid()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().positive(),
});

export const createBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().url(),
  link: z.string().url().optional(),
  cta: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1),
  description: z.string().optional(),
});
