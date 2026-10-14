import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shophub.com' },
    update: {},
    create: {
      email: 'admin@shophub.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@shophub.com' },
    update: {},
    create: {
      email: 'customer@shophub.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      isVerified: true,
    },
  });

  await prisma.cart.create({ data: { userId: customer.id } });
  await prisma.wishlist.create({ data: { userId: customer.id } });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'men' }, update: {}, create: { name: 'Men', slug: 'men', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'women' }, update: {}, create: { name: 'Women', slug: 'women', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'home' }, update: {}, create: { name: 'Home & Living', slug: 'home', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports', sortOrder: 5 } }),
  ]);

  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'nike' }, update: {}, create: { name: 'Nike', slug: 'nike' } }),
    prisma.brand.upsert({ where: { slug: 'apple' }, update: {}, create: { name: 'Apple', slug: 'apple' } }),
    prisma.brand.upsert({ where: { slug: 'samsung' }, update: {}, create: { name: 'Samsung', slug: 'samsung' } }),
    prisma.brand.upsert({ where: { slug: 'puma' }, update: {}, create: { name: 'Puma', slug: 'puma' } }),
    prisma.brand.upsert({ where: { slug: 'sony' }, update: {}, create: { name: 'Sony', slug: 'sony' } }),
  ]);

  const products = [
    {
      name: 'Premium Running Shoes',
      slug: 'premium-running-shoes',
      sku: 'SHOE-001',
      brandId: brands[0].id,
      categoryId: categories[0].id,
      description: '<p>High-performance running shoes with advanced cushioning technology. Perfect for daily runs and marathon training.</p>',
      shortDescription: 'Lightweight running shoes with premium cushioning',
      price: 8999,
      mrp: 12999,
      discountPercent: 31,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Running Shoes', isPrimary: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', alt: 'Running Shoes Side', sortOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: 'Size 8 / Black', sku: 'SHOE-001-8-BLK', price: 8999, mrp: 12999, stock: 25, attributes: { size: '8', color: 'Black' } },
          { name: 'Size 9 / Black', sku: 'SHOE-001-9-BLK', price: 8999, mrp: 12999, stock: 30, attributes: { size: '9', color: 'Black' } },
          { name: 'Size 10 / Black', sku: 'SHOE-001-10-BLK', price: 8999, mrp: 12999, stock: 20, attributes: { size: '10', color: 'Black' } },
          { name: 'Size 9 / White', sku: 'SHOE-001-9-WHT', price: 9499, mrp: 13499, stock: 15, attributes: { size: '9', color: 'White' } },
        ],
      },
      specifications: {
        create: [
          { name: 'Material', value: 'Mesh & Synthetic' },
          { name: 'Sole', value: 'Rubber' },
          { name: 'Closure', value: 'Lace-Up' },
          { name: 'Weight', value: '280g' },
        ],
      },
    },
    {
      name: 'Wireless Noise Cancelling Headphones',
      slug: 'wireless-headphones',
      sku: 'ELEC-001',
      brandId: brands[4].id,
      categoryId: categories[2].id,
      description: '<p>Premium wireless headphones with industry-leading noise cancellation. 30-hour battery life, Hi-Res audio support.</p>',
      shortDescription: 'Premium ANC headphones with 30-hour battery',
      price: 24999,
      mrp: 34999,
      discountPercent: 29,
      isFeatured: true,
      isBestSeller: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Headphones', isPrimary: true, sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'Black', sku: 'ELEC-001-BLK', price: 24999, mrp: 34999, stock: 50, attributes: { color: 'Black' } },
          { name: 'Silver', sku: 'ELEC-001-SLV', price: 24999, mrp: 34999, stock: 30, attributes: { color: 'Silver' } },
        ],
      },
      specifications: {
        create: [
          { name: 'Connectivity', value: 'Bluetooth 5.2' },
          { name: 'Battery Life', value: '30 hours' },
          { name: 'Driver', value: '40mm' },
          { name: 'Weight', value: '254g' },
        ],
      },
    },
    {
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      sku: 'ELEC-002',
      brandId: brands[2].id,
      categoryId: categories[2].id,
      description: '<p>Advanced fitness tracking with GPS, heart rate monitor, SpO2 sensor, and 7-day battery life. Water resistant to 50m.</p>',
      shortDescription: 'Feature-rich smartwatch with GPS tracking',
      price: 12999,
      mrp: 17999,
      discountPercent: 28,
      isFeatured: true,
      isNewArrival: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Smart Watch', isPrimary: true, sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: '40mm / Black', sku: 'ELEC-002-40-BLK', price: 12999, mrp: 17999, stock: 40, attributes: { size: '40mm', color: 'Black' } },
          { name: '44mm / Black', sku: 'ELEC-002-44-BLK', price: 14999, mrp: 19999, stock: 35, attributes: { size: '44mm', color: 'Black' } },
          { name: '40mm / Silver', sku: 'ELEC-002-40-SLV', price: 12999, mrp: 17999, stock: 25, attributes: { size: '40mm', color: 'Silver' } },
        ],
      },
      specifications: {
        create: [
          { name: 'Display', value: '1.4" AMOLED' },
          { name: 'Battery', value: '7 days' },
          { name: 'Water Resistance', value: '5 ATM' },
          { name: 'Sensors', value: 'HR, SpO2, GPS' },
        ],
      },
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      sku: 'MEN-001',
      brandId: brands[0].id,
      categoryId: categories[0].id,
      description: '<p>Ultra-soft premium cotton t-shirt with a modern fit. Pre-shrunk, breathable fabric for all-day comfort.</p>',
      shortDescription: 'Soft cotton t-shirt with modern fit',
      price: 1499,
      mrp: 2499,
      discountPercent: 40,
      isNewArrival: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt: 'T-Shirt', isPrimary: true, sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'S / White', sku: 'MEN-001-S-WHT', price: 1499, mrp: 2499, stock: 50, attributes: { size: 'S', color: 'White' } },
          { name: 'M / White', sku: 'MEN-001-M-WHT', price: 1499, mrp: 2499, stock: 60, attributes: { size: 'M', color: 'White' } },
          { name: 'L / White', sku: 'MEN-001-L-WHT', price: 1499, mrp: 2499, stock: 45, attributes: { size: 'L', color: 'White' } },
          { name: 'M / Black', sku: 'MEN-001-M-BLK', price: 1499, mrp: 2499, stock: 40, attributes: { size: 'M', color: 'Black' } },
        ],
      },
    },
    {
      name: 'Elegant Summer Dress',
      slug: 'elegant-summer-dress',
      sku: 'WOM-001',
      categoryId: categories[1].id,
      description: '<p>Beautiful summer dress with floral print. Lightweight, flowy fabric perfect for warm weather.</p>',
      shortDescription: 'Floral print summer dress',
      price: 2999,
      mrp: 4999,
      discountPercent: 40,
      isFeatured: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', alt: 'Dress', isPrimary: true, sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'S', sku: 'WOM-001-S', price: 2999, mrp: 4999, stock: 20, attributes: { size: 'S' } },
          { name: 'M', sku: 'WOM-001-M', price: 2999, mrp: 4999, stock: 30, attributes: { size: 'M' } },
          { name: 'L', sku: 'WOM-001-L', price: 2999, mrp: 4999, stock: 25, attributes: { size: 'L' } },
        ],
      },
    },
    {
      name: 'Wireless Bluetooth Speaker',
      slug: 'wireless-speaker',
      sku: 'ELEC-003',
      brandId: brands[4].id,
      categoryId: categories[2].id,
      description: '<p>360-degree sound with deep bass. IP67 waterproof, dustproof. 24-hour playtime. Perfect for outdoor adventures.</p>',
      shortDescription: 'Portable waterproof Bluetooth speaker',
      price: 4999,
      mrp: 7999,
      discountPercent: 38,
      isBestSeller: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', alt: 'Speaker', isPrimary: true, sortOrder: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'Black', sku: 'ELEC-003-BLK', price: 4999, mrp: 7999, stock: 60, attributes: { color: 'Black' } },
          { name: 'Blue', sku: 'ELEC-003-BLU', price: 4999, mrp: 7999, stock: 40, attributes: { color: 'Blue' } },
        ],
      },
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData as any,
    });
    console.log(`Created product: ${product.name}`);
  }

  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off on first order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscount: 500,
      perUserLimit: 1,
      startDate: new Date('2024-01-01'),
      expiryDate: new Date('2026-12-31'),
      usageLimit: 1000,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200',
      cta: 'Shop Now',
      link: '/products',
      sortOrder: 1,
    },
  });

  console.log('Seed completed!');
  console.log('Admin: admin@shophub.com / admin123');
  console.log('Customer: customer@shophub.com / user123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
