export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  mrp: number;
  discountPercent: number;
  taxPercent: number;
  averageRating: number;
  reviewCount: number;
  totalSold: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  brand?: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications?: ProductSpecification[];
  features?: ProductFeature[];
  reviews?: Review[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
}

export interface ProductFeature {
  id: string;
  title: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  _count?: { products: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
}

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  couponDiscount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  user?: User;
  payments?: any[];
  returns?: any[];
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  cta?: string;
  sortOrder: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
