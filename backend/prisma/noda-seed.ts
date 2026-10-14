import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COLOURS = ['Black', 'White', 'Red'] as const;
const SIZES = ['XL', 'L', 'Oversized'] as const;

const COLOUR_MAP: Record<string, string> = {
  Black: 'BLK',
  White: 'WHT',
  Red: 'RED',
};

const SIZE_MAP: Record<string, string> = {
  XL: 'XL',
  L: 'L',
  Oversized: 'OVR',
};

// Stock distribution per artwork per colour
const STOCK: Record<string, Record<string, number>> = {
  Black: { XL: 3, L: 3, Oversized: 3 },
  White: { XL: 3, L: 3, Oversized: 3 },
  Red: { XL: 2, L: 2, Oversized: 3 },
};

const PRICE = 1499;
const MRP = 2499;

async function seedNoda() {
  console.log('Starting NODA production seed...\n');

  // 1. Find or create NODA category and brand
  let category = await prisma.category.findUnique({ where: { slug: 'noda' } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'NODA', slug: 'noda', description: 'NODA premium DTF printed apparel' },
    });
    console.log('Created NODA category');
  }

  let brand = await prisma.brand.findUnique({ where: { slug: 'noda' } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: { name: 'NODA', slug: 'noda', description: 'NODA Streetwear' },
    });
    console.log('Created NODA brand');
  }

  // 2. Create 10 artworks
  const artworks = [];
  for (let i = 1; i <= 10; i++) {
    const code = `NODA-${String(i).padStart(2, '0')}`;
    const existing = await prisma.artwork.findUnique({ where: { code } });
    if (existing) {
      artworks.push(existing);
      console.log(`Artwork ${code} already exists, skipping`);
    } else {
      const artwork = await prisma.artwork.create({
        data: {
          code,
          name: `NODA Design ${String(i).padStart(2, '0')}`,
          description: `DTF artwork design ${code} for NODA premium collection`,
          status: 'active',
        },
      });
      artworks.push(artwork);
      console.log(`Created artwork ${code}`);
    }
  }

  // 3. Find or create NODA product
  let product = await prisma.product.findUnique({ where: { slug: 'noda-premium-dtf-collection' } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        name: 'NODA Premium DTF Collection',
        slug: 'noda-premium-dtf-collection',
        sku: 'NODA-PRODUCT-001',
        brandId: brand.id,
        categoryId: category.id,
        description: '<p>Premium DTF printed t-shirts from NODA. Each design is printed on high-quality fabric with durable Direct-to-Film technology. Choose from 10 unique artworks, 3 colours, and 3 sizes.</p>',
        shortDescription: 'Premium DTF printed t-shirts - 10 unique designs',
        price: PRICE,
        mrp: MRP,
        discountPercent: 40,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
      },
    });
    console.log('Created NODA product');
  }

  // 4. Create 90 SKUs (10 artworks × 3 colours × 3 sizes)
  let createdCount = 0;
  let skippedCount = 0;

  for (const artwork of artworks) {
    for (const colour of COLOURS) {
      for (const size of SIZES) {
        const sku = `NODA-${artwork.code.replace('NODA-', '')}-${COLOUR_MAP[colour]}-${SIZE_MAP[size]}`;
        const variantName = `${artwork.code} / ${colour} / ${size}`;
        const stock = STOCK[colour][size as keyof typeof STOCK['Black']];

        const existing = await prisma.productVariant.findUnique({ where: { sku } });
        if (existing) {
          skippedCount++;
          continue;
        }

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            artworkId: artwork.id,
            sku,
            name: variantName,
            price: PRICE,
            mrp: MRP,
            stock,
            attributes: { colour, size, artwork: artwork.code },
          },
        });
        createdCount++;
      }
    }
  }

  console.log(`\nCreated ${createdCount} new SKUs, skipped ${skippedCount} existing`);

  // 5. Validate
  const totalVariants = await prisma.productVariant.count({
    where: { productId: product.id },
  });
  const totalStock = await prisma.productVariant.aggregate({
    where: { productId: product.id },
    _sum: { stock: true },
  });

  console.log('\n=== VALIDATION ===');
  console.log(`Total SKUs: ${totalVariants} (expected: 90)`);
  console.log(`Total Stock: ${totalStock._sum.stock} (expected: 250)`);

  // Colour breakdown
  const allVariants = await prisma.productVariant.findMany({
    where: { productId: product.id },
  });
  for (const colour of COLOURS) {
    const colourTotal = allVariants
      .filter((v) => {
        const attrs = v.attributes as any;
        return attrs?.colour === colour;
      })
      .reduce((sum, v) => sum + v.stock, 0);
    console.log(`${colour}: ${colourTotal} units (expected: ${colour === 'Red' ? 70 : 90})`);
  }

  // Artwork breakdown
  for (const artwork of artworks) {
    const artworkTotal = allVariants
      .filter((v) => v.artworkId === artwork.id)
      .reduce((sum, v) => sum + v.stock, 0);
    console.log(`${artwork.code}: ${artworkTotal} units (expected: 25)`);
  }

  console.log('\nNODA seed complete!');
}

seedNoda()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
