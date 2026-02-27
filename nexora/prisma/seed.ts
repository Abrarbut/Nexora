import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clear existing data ────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.subOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.product.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // ─── Categories ─────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Electronics", slug: "electronics", commissionRate: 12 },
    }),
    prisma.category.create({
      data: { name: "Clothing", slug: "clothing", commissionRate: 10 },
    }),
    prisma.category.create({
      data: { name: "Home & Garden", slug: "home-garden", commissionRate: 8 },
    }),
    prisma.category.create({
      data: { name: "Books", slug: "books", commissionRate: 5 },
    }),
    prisma.category.create({
      data: { name: "Sports & Outdoors", slug: "sports-outdoors", commissionRate: 10 },
    }),
    prisma.category.create({
      data: { name: "Health & Beauty", slug: "health-beauty", commissionRate: 15 },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ─── Super Admin ────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Admin@12345", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@nexora.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Created Super Admin: ${admin.email}`);

  // ─── Test Customer ──────────────────────────────────
  const customerPassword = await bcrypt.hash("Customer@123", 12);

  const customer = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "customer@nexora.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // Create cart & wishlist for customer
  await prisma.cart.create({
    data: { userId: customer.id, items: [] },
  });
  await prisma.wishlist.create({
    data: { userId: customer.id, productIds: [] },
  });

  console.log(`✅ Created test customer: ${customer.email}`);

  // ─── Test Vendor ────────────────────────────────────
  const vendorPassword = await bcrypt.hash("Vendor@123", 12);

  const vendorUser = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "vendor@nexora.com",
      password: vendorPassword,
      role: "VENDOR",
    },
  });

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      storeName: "TechHub Store",
      slug: "techhub-store",
      description: "Premium electronics and gadgets at the best prices.",
      status: "APPROVED",
      commissionRate: 10,
    },
  });

  console.log(`✅ Created test vendor: ${vendorUser.email}`);

  // ─── Sample Products ────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        vendorId: vendorProfile.id,
        title: "Wireless Bluetooth Headphones",
        description:
          "High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium comfort padding.",
        price: 79.99,
        stock: 50,
        images: ["https://via.placeholder.com/400x400?text=Headphones"],
        categoryId: categories[0].id,
        status: "ACTIVE",
        rating: 4.5,
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorProfile.id,
        title: "Mechanical Gaming Keyboard",
        description:
          "RGB mechanical keyboard with Cherry MX switches, programmable keys, and aluminum frame.",
        price: 129.99,
        stock: 30,
        images: ["https://via.placeholder.com/400x400?text=Keyboard"],
        categoryId: categories[0].id,
        status: "ACTIVE",
        rating: 4.7,
      },
    }),
    prisma.product.create({
      data: {
        vendorId: vendorProfile.id,
        title: "Classic Cotton T-Shirt",
        description:
          "100% organic cotton t-shirt, available in multiple colors. Comfortable fit for everyday wear.",
        price: 24.99,
        stock: 100,
        images: ["https://via.placeholder.com/400x400?text=TShirt"],
        categoryId: categories[1].id,
        status: "ACTIVE",
        rating: 4.2,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} sample products`);

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────");
  console.log("Admin Login:    admin@nexora.com / Admin@12345");
  console.log("Customer Login: customer@nexora.com / Customer@123");
  console.log("Vendor Login:   vendor@nexora.com / Vendor@123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
