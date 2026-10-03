const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create or ensure default demo user
  const user = await prisma.user.upsert({
    where: { id: 'default-roommate-user' },
    update: {},
    create: {
      id: 'default-roommate-user',
      name: 'Rohan & Kabir (Room 402)',
      email: 'room402@messylist.local',
    },
  });

  console.log(`👤 Default user ready: ${user.name}`);

  // 2. Clear previous seed data if desired or upsert
  await prisma.groceryItem.deleteMany({});
  await prisma.groceryList.deleteMany({});
  await prisma.groceryPreference.deleteMany({});

  // 3. Realistic Roommate Grocery Preferences
  const preferences = [
    {
      userId: user.id,
      itemName: 'Milk',
      preferredProduct: 'Amul Taaza Toned Milk',
      defaultQuantity: 1,
      defaultUnit: 'packet',
      category: 'Dairy',
      notes: 'Always get blue packet (Amul Taaza), not buffalo milk',
    },
    {
      userId: user.id,
      itemName: 'Bread',
      preferredProduct: 'English Oven 100% Whole Wheat Brown Bread',
      defaultQuantity: 1,
      defaultUnit: 'pack',
      category: 'Bakery',
      notes: 'Check expiry date (minimum 3 days remaining)',
    },
    {
      userId: user.id,
      itemName: 'Eggs',
      preferredProduct: 'Farm Fresh White Eggs',
      defaultQuantity: 12,
      defaultUnit: 'pieces',
      category: 'Dairy & Eggs',
      notes: 'Tray of 12 or 30 depending on deal',
    },
    {
      userId: user.id,
      itemName: 'Atta',
      preferredProduct: 'Aashirvaad Shudh Chakki Atta',
      defaultQuantity: 5,
      defaultUnit: 'kg',
      category: 'Pantry & Grains',
      notes: '5kg pack only, fits in our kitchen container',
    },
    {
      userId: user.id,
      itemName: 'Chips',
      preferredProduct: 'Kurkure Masala Munch / Lays Blue',
      defaultQuantity: 2,
      defaultUnit: 'packs',
      category: 'Snacks',
      notes: 'Party pack if guests coming',
    },
    {
      userId: user.id,
      itemName: 'Maggi',
      preferredProduct: 'Maggi 2-Minute Masala Noodles (Pack of 4)',
      defaultQuantity: 1,
      defaultUnit: 'pack',
      category: 'Snacks',
      notes: 'Late night emergency stock',
    },
    {
      userId: user.id,
      itemName: 'Coffee',
      preferredProduct: 'Nescafe Classic 50g jar',
      defaultQuantity: 1,
      defaultUnit: 'jar',
      category: 'Beverages',
      notes: 'Don’t get chicory blend',
    },
  ];

  for (const pref of preferences) {
    await prisma.groceryPreference.create({
      data: pref,
    });
  }
  console.log(`✨ Seeded ${preferences.length} grocery preferences.`);

  // 4. Sample Grocery Lists for Purchase History
  // List 1: Previous weekend completed restock
  const list1 = await prisma.groceryList.create({
    data: {
      userId: user.id,
      title: 'Weekend Restock & Snack Run',
      rawInput: 'bhai amul doodh le aana 2 packet, maggi pack of 4, aur eggs 12. bread bhi le lena.',
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      items: {
        create: [
          {
            name: 'Amul Taaza Toned Milk',
            quantity: 2,
            unit: 'packet',
            category: 'Dairy',
            notes: 'Matched roommate preference',
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000),
            confidence: 0.98,
          },
          {
            name: 'Maggi 2-Minute Masala Noodles',
            quantity: 1,
            unit: 'pack',
            category: 'Snacks',
            notes: 'Pack of 4',
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3700000),
            confidence: 0.95,
          },
          {
            name: 'Farm Fresh White Eggs',
            quantity: 12,
            unit: 'pieces',
            category: 'Dairy & Eggs',
            notes: null,
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3800000),
            confidence: 0.99,
          },
          {
            name: 'English Oven Brown Bread',
            quantity: 1,
            unit: 'pack',
            category: 'Bakery',
            notes: 'Whole wheat',
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3900000),
            confidence: 0.97,
          },
        ],
      },
    },
  });

  // List 2: Midweek Quick Run (Partially purchased)
  const list2 = await prisma.groceryList.create({
    data: {
      userId: user.id,
      title: 'Wednesday Midweek Essentials',
      rawInput: 'chai patti khatam hai, sugar 1kg le aana, bananas aur apples. actually sugar mummy bhej rahi so no sugar.',
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      items: {
        create: [
          {
            name: 'Tea Leaves (Chai Patti)',
            quantity: 500,
            unit: 'g',
            category: 'Beverages',
            notes: 'Taj Mahal or Red Label',
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4000000),
            confidence: 0.95,
          },
          {
            name: 'Bananas',
            quantity: 6,
            unit: 'pieces',
            category: 'Produce',
            notes: 'Slightly ripe',
            status: 'active',
            isPurchased: true,
            purchasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4100000),
            confidence: 0.92,
          },
          {
            name: 'Apples',
            quantity: 1,
            unit: 'kg',
            category: 'Produce',
            notes: 'Kashmiri/Shimla',
            status: 'active',
            isPurchased: false,
            confidence: 0.91,
          },
          {
            name: 'Sugar',
            quantity: 1,
            unit: 'kg',
            category: 'Pantry',
            notes: 'Cancelled: Mummy is sending sugar',
            status: 'cancelled',
            isPurchased: false,
            confidence: 0.99,
          },
        ],
      },
    },
  });

  console.log(`🛒 Created 2 initial grocery lists (${list1.id}, ${list2.id}) with realistic items.`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
