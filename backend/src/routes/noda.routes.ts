import { Router } from 'express';
import prisma from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { Role } from '@prisma/client';

const router = Router();
router.use(requireAuth, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/production', async (_req, res, next) => {
  try {
    const nodaProduct = await prisma.product.findUnique({ where: { slug: 'noda-premium-dtf-collection' } });
    if (!nodaProduct) return sendSuccess(res, null);

    const variants = await prisma.productVariant.findMany({
      where: { productId: nodaProduct.id },
      include: { artwork: true },
      orderBy: { sku: 'asc' },
    });

    const artworks = await prisma.artwork.findMany({ orderBy: { code: 'asc' } });

    const totalProduction = variants.reduce((sum, v) => sum + v.stock, 0);
    const totalSKUs = variants.length;
    const totalArtworks = artworks.length;
    const totalDTFPlacements = totalProduction;

    const colourBreakdown = {
      Black: variants.filter((v) => (v.attributes as any)?.colour === 'Black').reduce((s, v) => s + v.stock, 0),
      White: variants.filter((v) => (v.attributes as any)?.colour === 'White').reduce((s, v) => s + v.stock, 0),
      Red: variants.filter((v) => (v.attributes as any)?.colour === 'Red').reduce((s, v) => s + v.stock, 0),
    };

    const sizeBreakdown = {
      XL: variants.filter((v) => (v.attributes as any)?.size === 'XL').reduce((s, v) => s + v.stock, 0),
      L: variants.filter((v) => (v.attributes as any)?.size === 'L').reduce((s, v) => s + v.stock, 0),
      Oversized: variants.filter((v) => (v.attributes as any)?.size === 'Oversized').reduce((s, v) => s + v.stock, 0),
    };

    const artworkBreakdown = artworks.map((art) => {
      const artVariants = variants.filter((v) => v.artworkId === art.id);
      return {
        code: art.code,
        name: art.name,
        total: artVariants.reduce((s, v) => s + v.stock, 0),
        black: artVariants.filter((v) => (v.attributes as any)?.colour === 'Black').reduce((s, v) => s + v.stock, 0),
        white: artVariants.filter((v) => (v.attributes as any)?.colour === 'White').reduce((s, v) => s + v.stock, 0),
        red: artVariants.filter((v) => (v.attributes as any)?.colour === 'Red').reduce((s, v) => s + v.stock, 0),
      };
    });

    const lowStock = variants.filter((v) => v.stock > 0 && v.stock <= 3).length;
    const outOfStock = variants.filter((v) => v.stock === 0).length;

    sendSuccess(res, {
      totalProduction,
      totalAvailable: totalProduction,
      totalSKUs,
      totalArtworks,
      totalDTFPlacements,
      colourBreakdown,
      sizeBreakdown,
      artworkBreakdown,
      lowStock,
      outOfStock,
    });
  } catch (error) { next(error); }
});

router.get('/inventory', async (req, res, next) => {
  try {
    const { search, colour, size, status } = req.query;
    const nodaProduct = await prisma.product.findUnique({ where: { slug: 'noda-premium-dtf-collection' } });
    if (!nodaProduct) return sendSuccess(res, []);

    const where: any = { productId: nodaProduct.id };
    if (search) {
      where.OR = [
        { sku: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { artwork: { code: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    let variants = await prisma.productVariant.findMany({
      where,
      include: { artwork: true },
      orderBy: { sku: 'asc' },
    });

    if (colour) {
      variants = variants.filter((v) => (v.attributes as any)?.colour === colour);
    }
    if (size) {
      variants = variants.filter((v) => (v.attributes as any)?.size === size);
    }
    if (status === 'in_stock') {
      variants = variants.filter((v) => v.stock > 3);
    } else if (status === 'low_stock') {
      variants = variants.filter((v) => v.stock > 0 && v.stock <= 3);
    } else if (status === 'out_of_stock') {
      variants = variants.filter((v) => v.stock === 0);
    }

    sendSuccess(res, variants);
  } catch (error) { next(error); }
});

router.put('/inventory/:variantId', async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return sendSuccess(res, null, 200, 'Invalid stock value');
    }

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return sendSuccess(res, null, 200, 'Variant not found');

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    sendSuccess(res, updated, 200, 'Stock updated');
  } catch (error) { next(error); }
});

router.get('/artwork/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const artwork = await prisma.artwork.findUnique({
      where: { code },
      include: {
        variants: {
          include: { product: true },
          orderBy: { sku: 'asc' },
        },
      },
    });
    if (!artwork) return sendSuccess(res, null, 200, 'Artwork not found');

    const colourBreakdown = {
      Black: artwork.variants.filter((v) => (v.attributes as any)?.colour === 'Black'),
      White: artwork.variants.filter((v) => (v.attributes as any)?.colour === 'White'),
      Red: artwork.variants.filter((v) => (v.attributes as any)?.colour === 'Red'),
    };

    sendSuccess(res, {
      ...artwork,
      colourBreakdown,
      totalUnits: artwork.variants.reduce((s, v) => s + v.stock, 0),
    });
  } catch (error) { next(error); }
});

export default router;
