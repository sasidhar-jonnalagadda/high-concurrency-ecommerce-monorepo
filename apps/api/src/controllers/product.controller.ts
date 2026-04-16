import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { redis } from '../config/redis';
import { generateSlug } from '../utils/slug';
import { ResourceNotFoundError, BadRequestError } from '../utils/errors';

async function invalidateProductCache(): Promise<void> {
  const stream = redis.scanStream({
    match: 'products:*',
    count: 100,
  });

  return new Promise((resolve, reject) => {
    stream.on('data', async (keys: string[]) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        try {
          await pipeline.exec();
        } catch (err) {
          console.error('Pipeline execution failed during cache invalidation:', err);
        }
      }
    });

    stream.on('end', () => resolve());
    stream.on('error', (err: Error) => reject(err));
  });
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword as string | undefined;
    const category = req.query.category as string | undefined;
    const status = req.query.status as string | undefined;

    const cacheKey = `products:page:${page}:kw:${keyword || ''}:cat:${category || ''}:status:${status || 'active'}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const where: Record<string, any> = {};
    
    // Determine archive filter based on status
    if (status === 'archived') {
      where.isArchived = true;
    } else if (status === 'all') {
      // No archive filter applied
    } else {
      // Default to showing only active products
      where.isArchived = false;
    }

    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pageSize * (page - 1),
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      data: products,
      page,
      pages: Math.ceil(total / pageSize),
      total,
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const cacheKey = `products:slug:${slug}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new ResourceNotFoundError('Product', slug);
    }

    await redis.setex(cacheKey, 60, JSON.stringify(product));
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cached = await redis.get('products:top');
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const products = await prisma.product.findMany({
      orderBy: { rating: 'desc' },
      take: 4,
    });

    await redis.setex('products:top', 120, JSON.stringify(products));
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, image, description, brand, category, price, countInStock } = req.body;

    const baseSlug = generateSlug(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const finalSlug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        image,
        description,
        brand,
        category,
        price,
        countInStock,
      },
    });

    await invalidateProductCache();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, image, description, brand, category, price, countInStock } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ResourceNotFoundError('Product', id);
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (brand !== undefined) updateData.brand = brand;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (countInStock !== undefined) updateData.countInStock = countInStock;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await invalidateProductCache();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new ResourceNotFoundError('Product', id);
    }

    // Soft Delete: Toggle archival status instead of removing the row
    await prisma.product.update({ 
      where: { id },
      data: { isArchived: !product.isArchived }
    });
    
    await invalidateProductCache();
    res.json({ message: product.isArchived ? 'Product restored' : 'Product archived' });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ResourceNotFoundError('Product', productId);
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingReview) {
      throw new BadRequestError('Product already reviewed');
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: { rating, comment, userId, productId },
      });

      const aggregation = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: aggregation._avg?.rating ?? 0,
          numReviews: Number(aggregation._count?.rating ?? 0),
        },
      });
    });

    await invalidateProductCache();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { qty } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ResourceNotFoundError('Product', id);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { countInStock: Number(qty) },
    });

    await invalidateProductCache();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};
