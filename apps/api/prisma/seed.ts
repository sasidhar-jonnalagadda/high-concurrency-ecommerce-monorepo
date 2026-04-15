import { env } from '../src/config/env';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

const SAMPLE_PRODUCTS = [
  {
    name: 'Airpods Wireless Bluetooth Headphones',
    slug: 'airpods-wireless-bluetooth-headphones',
    image: 'https://placehold.co/600x400/EEE/31343C?text=Airpods',
    description: 'Bluetooth technology lets you connect it with compatible devices wirelessly. High-quality AAC audio offers immersive listening experience.',
    brand: 'Apple',
    category: 'Electronics',
    price: 8999.99,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'iPhone 15 Pro 256GB',
    slug: 'iphone-15-pro-256gb',
    image: 'https://placehold.co/600x400/EEE/31343C?text=iPhone+15+Pro',
    description: 'Introducing the iPhone 15 Pro. A transformative triple-camera system with A17 chip. Titanium design. Action button.',
    brand: 'Apple',
    category: 'Electronics',
    price: 134999.0,
    countInStock: 7,
    rating: 4.0,
    numReviews: 8,
  },
  {
    name: 'Cannon EOS 80D DSLR Camera',
    slug: 'cannon-eos-80d-dslr-camera',
    image: 'https://placehold.co/600x400/EEE/31343C?text=Canon+EOS+80D',
    description: 'Characterized by versatile imaging specs, the Canon EOS 80D features a 24.2MP APS-C CMOS sensor.',
    brand: 'Canon',
    category: 'Electronics',
    price: 92999.99,
    countInStock: 5,
    rating: 3.0,
    numReviews: 12,
  },
  {
    name: 'Sony PlayStation 5',
    slug: 'sony-playstation-5',
    image: 'https://placehold.co/600x400/EEE/31343C?text=PlayStation+5',
    description: 'The ultimate home entertainment center. Lightning speed. Stunning games. An all-digital version of PS5.',
    brand: 'Sony',
    category: 'Electronics',
    price: 49999.99,
    countInStock: 11,
    rating: 5.0,
    numReviews: 12,
  },
  {
    name: 'Logitech G-Series Gaming Mouse',
    slug: 'logitech-g-series-gaming-mouse',
    image: 'https://placehold.co/600x400/EEE/31343C?text=Logitech+Mouse',
    description: 'Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse. The six programmable buttons.',
    brand: 'Logitech',
    category: 'Electronics',
    price: 4999.99,
    countInStock: 7,
    rating: 3.5,
    numReviews: 10,
  },
  {
    name: 'Amazon Echo Dot 5th Generation',
    slug: 'amazon-echo-dot-5th-generation',
    image: 'https://placehold.co/600x400/EEE/31343C?text=Echo+Dot',
    description: 'Meet Echo Dot — our most popular smart speaker with a fabric design. It is our most compact smart speaker.',
    brand: 'Amazon',
    category: 'Electronics',
    price: 3499.99,
    countInStock: 0,
    rating: 4.0,
    numReviews: 12,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('👥 Syncing users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log(`✅ Users created: ${admin.email}, ${john.email}`);

  const testAdmin = await prisma.user.upsert({
    where: { email: 'test@admin.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Test Admin',
      email: 'test@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Test Admin ensured: ${testAdmin.email}`);

  console.log('📦 Syncing products...');
  const syncedProducts = [];
  for (const product of SAMPLE_PRODUCTS) {
    const p = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    syncedProducts.push(p);
  }
  console.log(`✅ Synced ${syncedProducts.length} products`);

  console.log('⭐ Syncing sample reviews...');
  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: john.id,
        productId: syncedProducts[0].id,
      },
    },
    update: {},
    create: {
      rating: 5,
      comment: 'Amazing sound quality! Best wireless headphones I have used.',
      userId: john.id,
      productId: syncedProducts[0].id,
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
