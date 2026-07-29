import { PrismaClient, UserRole, OrderStatus, PhotoType, PriceType, JoinRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.joinRequest.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.skillGroup.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.jobPhoto.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.webhookEvent.deleteMany();
  console.log('✅ Data cleared\n');

  // Create users
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);
  const adminPasswordHash = await bcrypt.hash('mpanshak-112706', 12);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'mpanshak@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Platform Admin',
          phone: '+234 801 000 0001',
          address: '1 Admiralty Way',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          bio: 'Platform administrator',
        },
      },
    },
  });
  console.log('  ✓ Admin user created');

  // Artisan users - Nigerian names
  const artisans = [
    {
      email: 'chinedu.plumber@example.com',
      fullName: 'Chinedu Okonkwo',
      businessName: 'Chinedu Plumbing Services',
      category: 'Plumbing',
      description: 'Expert plumbing services with 10+ years experience across Lagos. Specializing in residential and commercial pipe repairs, installations, and maintenance.',
      yearsExperience: 12,
      hourlyRate: 15000,
      phone: '+234 802 345 6701',
      city: 'Lagos',
      state: 'Lagos',
    },
    {
      email: 'fatima.cleaner@example.com',
      fullName: 'Fatima Abubakar',
      businessName: 'Spotless Cleaning Co.',
      category: 'Cleaning',
      description: 'Professional cleaning services for homes and offices. Eco-friendly products used. Serving Lagos, Abuja, and Port Harcourt.',
      yearsExperience: 8,
      hourlyRate: 10000,
      phone: '+234 803 456 7802',
      city: 'Abuja',
      state: 'FCT',
    },
    {
      email: 'ade.electrician@example.com',
      fullName: 'Adeola Johnson',
      businessName: 'PowerFix Electrical',
      category: 'Electrical',
      description: 'Licensed electrician offering residential and commercial electrical services. Expert in inverter installations and solar panel wiring.',
      yearsExperience: 15,
      hourlyRate: 20000,
      phone: '+234 805 567 8903',
      city: 'Lagos',
      state: 'Lagos',
    },
    {
      email: 'grace.gardener@example.com',
      fullName: 'Grace Nwosu',
      businessName: 'Green Garden Landscaping',
      category: 'Gardening',
      description: 'Professional landscaping and gardening services. Transform your outdoor space with modern Nigerian garden design.',
      yearsExperience: 6,
      hourlyRate: 8000,
      phone: '+234 806 678 9004',
      city: 'Port Harcourt',
      state: 'Rivers',
    },
    {
      email: 'bola.carpenter@example.com',
      fullName: 'Bolaji Adebayo',
      businessName: 'WoodCraft Nigeria',
      category: 'Carpentry',
      description: 'Custom woodwork, furniture repair, and home improvements. Quality craftsmanship using locally sourced hardwoods.',
      yearsExperience: 20,
      hourlyRate: 18000,
      phone: '+234 807 789 0105',
      city: 'Ibadan',
      state: 'Oyo',
    },
    {
      email: 'ngozi.painter@example.com',
      fullName: 'Ngozi Eze',
      businessName: 'PaintPro Nigeria',
      category: 'Painting',
      description: 'Interior and exterior painting services. Free estimates and color consultation. Serving residential and commercial clients.',
      yearsExperience: 10,
      hourlyRate: 12000,
      phone: '+234 808 890 1206',
      city: 'Enugu',
      state: 'Enugu',
    },
    {
      email: 'musa.barber@example.com',
      fullName: 'Musa Abdullahi',
      businessName: 'Musa Barbing Salon',
      category: 'Barber',
      description: 'Professional barbing and hairstyling for men and boys. Clean cuts, modern styles, and traditional Nigerian barbering.',
      yearsExperience: 14,
      hourlyRate: 5000,
      phone: '+234 809 901 2309',
      city: 'Kano',
      state: 'Kano',
    },
    {
      email: 'eke.fruits@example.com',
      fullName: 'Eke Okafor',
      businessName: 'Eke Wheelbarrow Fruits',
      category: 'Fruit Hawking',
      description: 'Street fruit hawking on wheelbarrow — fresh oranges, bananas, pineapples, mangoes, and coconut delivered to your doorstep in Lagos.',
      yearsExperience: 8,
      hourlyRate: 3000,
      phone: '+234 815 678 9012',
      city: 'Lagos',
      state: 'Lagos',
    },
  ];

  const artisanUsers = [];
  for (const artisan of artisans) {
    const user = await prisma.user.create({
      data: {
        email: artisan.email,
        passwordHash,
        role: 'ARTISAN',
        emailVerified: true,
        profile: {
          create: {
            fullName: artisan.fullName,
            phone: artisan.phone,
            address: `${Math.floor(Math.random() * 50) + 1} ${['Admiralty Way', 'Broad Street', 'Ogunlana Drive', 'Allen Avenue', 'Opebi Road', 'Ajah Road'][Math.floor(Math.random() * 6)]}`,
            city: artisan.city,
            state: artisan.state,
            country: 'Nigeria',
            bio: `Professional ${artisan.category.toLowerCase()} service provider in ${artisan.city}`,
          },
        },
        businessProfile: {
          create: {
            businessName: artisan.businessName,
            category: artisan.category,
            description: artisan.description,
            yearsExperience: artisan.yearsExperience,
            hourlyRate: artisan.hourlyRate,
            isVerified: true,
            averageRating: 4.5 + Math.random() * 0.5,
            totalReviews: Math.floor(Math.random() * 100) + 20,
          },
        },
      },
    });
    artisanUsers.push(user);
    console.log(`  ✓ Artisan: ${artisan.fullName} (${artisan.businessName})`);
  }

  // Seller users - Nigerian stores
  const sellers = [
    {
      email: 'kemi.store@example.com',
      fullName: 'Kemi Adekunle',
      businessName: 'Kemi Home Essentials',
      category: 'Products',
      description: 'Quality home essentials, plumbing fittings, and hardware supplies at competitive prices. Delivery available nationwide.',
      phone: '+234 809 901 2307',
      city: 'Lagos',
      state: 'Lagos',
    },
    {
      email: 'amara.shop@example.com',
      fullName: 'Amara Obi',
      businessName: 'Amara Craft Village',
      category: 'Crafts',
      description: 'Handmade crafts, Ankara decorations, and custom orders. Unique items for your home and events.',
      phone: '+234 810 012 3408',
      city: 'Abuja',
      state: 'FCT',
    },
    {
      email: 'chibueze.fruits@example.com',
      fullName: 'Chibueze Nnamdi',
      businessName: 'Mama Nkechi Fruit Market',
      category: 'Products',
      description: 'Fresh fruits daily — oranges, bananas, pineapples, mangoes, and watermelon. Wheelbarrow delivery in Surulere, Lagos.',
      phone: '+234 814 567 8910',
      city: 'Lagos',
      state: 'Lagos',
    },
  ];

  const sellerUsers = [];
  for (const seller of sellers) {
    const user = await prisma.user.create({
      data: {
        email: seller.email,
        passwordHash,
        role: 'SELLER',
        emailVerified: true,
        profile: {
          create: {
            fullName: seller.fullName,
            phone: seller.phone,
            address: `${Math.floor(Math.random() * 50) + 1} ${['Market Road', 'Shoprite Complex', 'Palms Shopping Mall', 'Circle Mall'][Math.floor(Math.random() * 4)]}`,
            city: seller.city,
            state: seller.state,
            country: 'Nigeria',
            bio: `Owner of ${seller.businessName}`,
          },
        },
        businessProfile: {
          create: {
            businessName: seller.businessName,
            category: seller.category,
            description: seller.description,
            isVerified: true,
            averageRating: 4.3 + Math.random() * 0.7,
            totalReviews: Math.floor(Math.random() * 80) + 10,
          },
        },
      },
    });
    sellerUsers.push(user);
    console.log(`  ✓ Seller: ${seller.fullName} (${seller.businessName})`);
  }

  // Customer users - Nigerian names
  const customers = [
    {
      email: 'tunde.customer@example.com',
      fullName: 'Tunde Bakare',
      phone: '+234 811 123 4509',
      city: 'Lagos',
    },
    {
      email: 'adedayo.customer@example.com',
      fullName: 'Adedayo Oladipo',
      phone: '+234 812 234 5610',
      city: 'Abuja',
    },
    {
      email: 'chidinma.customer@example.com',
      fullName: 'Chidinma Okafor',
      phone: '+234 813 345 6711',
      city: 'Port Harcourt',
    },
  ];

  const customerUsers = [];
  for (const customer of customers) {
    const user = await prisma.user.create({
      data: {
        email: customer.email,
        passwordHash,
        role: 'CUSTOMER',
        emailVerified: true,
        profile: {
          create: {
            fullName: customer.fullName,
            phone: customer.phone,
            address: `${Math.floor(Math.random() * 100) + 1} Estate Road`,
            city: customer.city,
            state: customer.city === 'Lagos' ? 'Lagos' : customer.city === 'Abuja' ? 'FCT' : 'Rivers',
            country: 'Nigeria',
            bio: 'Looking for quality services',
          },
        },
      },
    });
    customerUsers.push(user);
    console.log(`  ✓ Customer: ${customer.fullName}`);
  }

  console.log('\n📦 Creating services...');

  // Get business profiles for artisans
  const artisanProfiles = await prisma.businessProfile.findMany({
    where: { userId: { in: artisanUsers.map((u) => u.id) } },
  });

  // Services for each artisan - Nigerian context with accurate images
  const servicesData = [
    // Plumbing services
    { artisanIdx: 0, title: 'Pipe Repair & Installation', description: 'Fix leaky pipes, install new plumbing systems', price: 25000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800'] },
    { artisanIdx: 0, title: 'Drain Cleaning', description: 'Professional drain and sewer cleaning service', price: 15000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800'] },
    { artisanIdx: 0, title: 'Water Heater / Geyser Installation', description: 'Install or repair water heater systems', price: 75000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1582894940187-27bd69b924d0?w=800'] },
    // Cleaning services
    { artisanIdx: 1, title: 'House Cleaning', description: 'Complete residential cleaning service', price: 20000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800'] },
    { artisanIdx: 1, title: 'Office Cleaning', description: 'Professional office and commercial cleaning', price: 35000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'] },
    // Electrical services
    { artisanIdx: 2, title: 'Electrical Repairs & Wiring', description: 'Fix electrical issues, rewiring, and installations', price: 25000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800'] },
    { artisanIdx: 2, title: 'Inverter & Solar Installation', description: 'Install inverter systems and solar panels', price: 150000, priceType: 'STARTING_AT', images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'] },
    { artisanIdx: 2, title: 'Generator Maintenance', description: 'Service and repair generators of all brands', price: 20000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1523559094051-53bac879eb80?w=800'] },
    // Gardening services
    { artisanIdx: 3, title: 'Lawn Mowing & Maintenance', description: 'Professional lawn care service', price: 10000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'] },
    { artisanIdx: 3, title: 'Garden Design & Landscaping', description: 'Custom garden design and setup', price: 50000, priceType: 'STARTING_AT', images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800'] },
    { artisanIdx: 3, title: 'Tree Trimming & Removal', description: 'Safe and professional tree services', price: 25000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1754321889123-0485c7fea5f1?w=800'] },
    // Carpentry services
    { artisanIdx: 4, title: 'Furniture Repair & Restoration', description: 'Repair and restore wooden furniture', price: 30000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1756736668332-e921516c1305?w=800'] },
    { artisanIdx: 4, title: 'Custom Woodwork & Carpentry', description: 'Custom shelves, cabinets, wardrobes, and more', price: 18000, priceType: 'HOURLY', images: ['https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800'] },
    // Painting services
    { artisanIdx: 5, title: 'Interior Painting', description: 'Professional interior painting services', price: 12000, priceType: 'HOURLY', images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800'] },
    { artisanIdx: 5, title: 'Wallpaper Installation', description: 'Professional wallpaper hanging and removal', price: 45000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1615873968403-89e068629265?w=800'] },
    // Barber services
    { artisanIdx: 6, title: 'Barbing & Haircut', description: 'Professional haircuts, shaves, and grooming for men and boys', price: 3000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1530550424927-9e80a195af9d?w=800', 'https://images.unsplash.com/photo-1703792686667-7486746389a1?w=800'] },
    { artisanIdx: 6, title: 'Kids Haircut', description: 'Gentle and patient haircuts for children', price: 2000, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1703792686667-7486746389a1?w=800'] },
    // Fruit hawking services
    { artisanIdx: 7, title: 'Coconut & Zobo Pack', description: 'Chilled fresh coconut water and zobo drink delivered on wheelbarrow', price: 1500, priceType: 'FIXED', images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800'] },
  ];

  for (const service of servicesData) {
    await prisma.service.create({
      data: {
        artisanId: artisanProfiles[service.artisanIdx].id,
        title: service.title,
        description: service.description,
        price: service.price,
        priceType: service.priceType as PriceType,
        images: service.images,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${servicesData.length} services created`);

  // Create products for sellers
  console.log('\n🛍️  Creating products...');
  const sellerProfiles = await prisma.businessProfile.findMany({
    where: { userId: { in: sellerUsers.map((u) => u.id) } },
  });

  const productsData = [
    { sellerIdx: 0, title: 'Complete Tool Set (100pcs)', description: 'Professional 100-piece tool set for home and workshop repairs', price: 45000, stockQuantity: 50, images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'] },
    { sellerIdx: 0, title: 'LED Flood Light', description: 'Bright portable LED flood light for construction sites', price: 8500, stockQuantity: 100, images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800'] },
    { sellerIdx: 0, title: 'Plumbing Fittings Bundle', description: 'Assorted plumbing fittings and connectors', price: 12000, stockQuantity: 200, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800'] },
    { sellerIdx: 1, title: 'Handmade Ankara Wall Art', description: 'Beautiful handcrafted Ankara fabric wall decoration', price: 15000, stockQuantity: 20, images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'] },
    { sellerIdx: 1, title: 'Decorative Plant Pot Set', description: 'Set of 3 handpainted decorative plant pots', price: 8500, stockQuantity: 45, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800'] },
    // Street fruit seller products
    { sellerIdx: 2, title: 'Fresh Oranges (bunch)', description: 'Juicy sweet oranges fresh from the orchard — perfect for juice or snacking', price: 1500, stockQuantity: 200, images: ['https://images.unsplash.com/photo-1543168256-418811576931?w=800', 'https://images.unsplash.com/photo-1766673097202-248bc5029d51?w=800'] },
    { sellerIdx: 2, title: 'Ripe Bananas (bunch)', description: 'Sun-ripened yellow bananas, sweet and ready to eat', price: 1000, stockQuantity: 150, images: ['https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800'] },
    { sellerIdx: 2, title: 'Fresh Pineapple', description: 'Whole sweet pineapple — juicy and freshly harvested', price: 2500, stockQuantity: 60, images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800'] },
    { sellerIdx: 2, title: 'Watermelon (whole)', description: 'Large, fresh watermelon — perfect for sharing on a hot day', price: 3500, stockQuantity: 40, images: ['https://images.unsplash.com/photo-1734255620882-77378ba420bb?w=800'] },
    { sellerIdx: 2, title: 'Mixed Fruit Pack', description: 'Assorted seasonal fruits in a bowl — oranges, banana, pineapple & watermelon', price: 5000, stockQuantity: 30, images: ['https://images.unsplash.com/photo-1766673097202-248bc5029d51?w=800', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800'] },
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        sellerId: sellerProfiles[product.sellerIdx].id,
        title: product.title,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        images: product.images,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${productsData.length} products created`);

  // Create orders
  console.log('\n📋 Creating orders...');
  const orders = [
    {
      customerId: customerUsers[0].id,
      providerId: artisanProfiles[0].id,
      status: 'COMPLETED' as OrderStatus,
      totalAmount: 25000,
      customerConfirmed: true,
      providerConfirmed: true,
    },
    {
      customerId: customerUsers[1].id,
      providerId: artisanProfiles[1].id,
      status: 'IN_PROGRESS' as OrderStatus,
      totalAmount: 35000,
      customerConfirmed: false,
      providerConfirmed: false,
    },
    {
      customerId: customerUsers[2].id,
      providerId: artisanProfiles[2].id,
      status: 'PENDING' as OrderStatus,
      totalAmount: 25000,
      customerConfirmed: false,
      providerConfirmed: false,
    },
  ];

  const createdOrders = [];
  for (const order of orders) {
    const created = await prisma.order.create({
      data: {
        ...order,
        platformFee: order.totalAmount * 0.1,
        providerPayout: order.totalAmount * 0.9,
        completedAt: order.status === 'COMPLETED' ? new Date() : null,
      },
    });
    createdOrders.push(created);
  }
  console.log(`  ✓ ${orders.length} orders created`);

  // Create reviews for completed orders
  console.log('\n⭐ Creating reviews...');
  await prisma.review.create({
    data: {
      orderId: createdOrders[0].id,
      reviewerId: customerUsers[0].id,
      revieweeId: artisanUsers[0].id,
      rating: 5,
      comment: 'Excellent plumbing service! Chinedu arrived on time and fixed the pipe leakage quickly. Very professional and affordable. Highly recommended!',
      images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'],
    },
  });
  console.log('  ✓ 1 review created');

  // Create messages
  console.log('\n💬 Creating messages...');
  const messages = [
    { senderId: customerUsers[0].id, receiverId: artisanUsers[0].id, content: 'Hello, I have a pipe leakage in my kitchen. Can you help?' },
    { senderId: artisanUsers[0].id, receiverId: customerUsers[0].id, content: 'Hello! I can help with that. Can you send me a photo of the leakage?' },
    { senderId: customerUsers[0].id, receiverId: artisanUsers[0].id, content: 'Sure, here it is. It has been leaking for two days now.' },
    { senderId: artisanUsers[0].id, receiverId: customerUsers[0].id, content: 'I see the issue. I can come tomorrow by 10am. Does that work for you?' },
    { senderId: customerUsers[0].id, receiverId: artisanUsers[0].id, content: 'Perfect! See you then. What will the cost be?' },
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }
  console.log(`  ✓ ${messages.length} messages created`);

  // Create skill groups
  console.log('\n👥 Creating skill groups...');
  const groups = [
    { name: 'Lagos Master Plumbers', description: 'Expert plumbing professionals in Lagos with 5+ years experience', category: 'Plumbing' },
    { name: 'Certified Electricians Nigeria', description: 'Licensed and certified electrical workers across Nigeria', category: 'Electrical' },
    { name: 'Professional Cleaners NG', description: 'Top-rated cleaning service providers in major cities', category: 'Cleaning' },
    { name: 'Nigerian Carpentry Guild', description: 'Skilled woodworking and carpentry professionals', category: 'Carpentry' },
    { name: 'Landscapers & Gardeners NG', description: 'Professional landscaping and gardening experts', category: 'Gardening' },
    { name: 'Painting Pros Nigeria', description: 'Interior and exterior painting specialists', category: 'Painting' },
  ];

  const createdGroups = [];
  for (const group of groups) {
    const created = await prisma.skillGroup.create({
      data: {
        ...group,
        createdBy: admin.id,
        memberCount: Math.floor(Math.random() * 30) + 10,
        pendingRequests: Math.floor(Math.random() * 5),
        status: 'active',
      },
    });
    createdGroups.push(created);
    console.log(`  ✓ Group: ${group.name}`);
  }

  // Add some members to groups
  console.log('\n🔗 Adding group members...');
  for (let i = 0; i < Math.min(artisanUsers.length, createdGroups.length); i++) {
    await prisma.groupMember.create({
      data: {
        groupId: createdGroups[i].id,
        userId: artisanUsers[i].id,
        role: 'member',
      },
    });
  }
  console.log(`  ✓ ${Math.min(artisanUsers.length, createdGroups.length)} group memberships created`);

  // Create some join requests
  console.log('\n📨 Creating join requests...');
  const joinRequests = [
    { groupId: createdGroups[0].id, userId: artisanUsers[3].id, message: 'I have 6 years of experience in gardening and want to learn plumbing skills.', status: JoinRequestStatus.PENDING },
    { groupId: createdGroups[1].id, userId: artisanUsers[4].id, message: 'Carpenter looking to expand skills into electrical work.', status: JoinRequestStatus.PENDING },
    { groupId: createdGroups[2].id, userId: artisanUsers[5].id, message: 'Painter interested in offering cleaning services too.', status: JoinRequestStatus.APPROVED },
  ];

  for (const request of joinRequests) {
    await prisma.joinRequest.create({
      data: {
        groupId: request.groupId,
        userId: request.userId,
        message: request.message,
        status: request.status,
        reviewedBy: request.status === JoinRequestStatus.APPROVED ? admin.id : null,
        reviewedAt: request.status === JoinRequestStatus.APPROVED ? new Date() : null,
      },
    });
  }
  console.log(`  ✓ ${joinRequests.length} join requests created`);

  // Create posts for the social wall
  // Each post has 2 images: [0] = "before" state (the problem/work needed),
  // [1] = "after" state (completed, cleaner result)
  console.log('\n📝 Creating posts...');
  const postsData = [
    {
      authorId: artisanUsers[0].id,
      // Plumber: [before=unfinished bathroom, after=finished modern bathroom]
      content: 'Just completed this beautiful bathroom renovation in Lagos! The client wanted a modern look with matte black fixtures. What do you think? 🛁✨\n\n#Plumbing #LagosArtisan #BathroomRenovation',
      images: ['https://images.unsplash.com/photo-1632214531975-b4c9198c01f8?w=800', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800'],
      videos: [],
      likes: 45,
      shares: 12,
    },
    {
      authorId: artisanUsers[1].id,
      // Cleaner: [before=dirty area/cleaning supplies, after=spotless clean room]
      content: 'Before and after of today\'s deep cleaning job in Abuja! Nothing satisfies us more than seeing a space transform from messy to spotless. 🧹✨\n\n#CleaningService #BeforeAndAfter #AbujaCleaning',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800'],
      videos: [],
      likes: 78,
      shares: 23,
    },
    {
      authorId: sellerUsers[0].id,
      // Seller product showcase: [tools packed, tools on display]
      content: '🎉 NEW ARRIVAL! Premium 100-piece tool set now available! Perfect for DIY enthusiasts and professionals alike. Get yours today - special launch price! 🔧\n\n• Chrome vanadium steel\n• Durable carrying case\n• Lifetime warranty\n• Delivery available nationwide',
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
      videos: [],
      likes: 156,
      shares: 45,
    },
    {
      authorId: artisanUsers[2].id,
      // Electrician: [before=faulty electrical panel, after=well-lit home with working electrics]
      content: '💡 Tip of the day: If your circuit breaker keeps tripping, don\'t ignore it! It could be a sign of overloaded circuits, faulty wiring, or a damaged appliance. Always consult a licensed electrician for safety.\n\nNeed electrical help? Book a free inspection today! We serve Lagos, Abuja, and Port Harcourt.',
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      videos: [],
      likes: 92,
      shares: 67,
    },
    {
      authorId: artisanUsers[3].id,
      // Gardener: [before=overgrown garden area, after=beautiful landscaped lawn]
      content: 'Transformed this compound in Port Harcourt into a beautiful garden paradise! 🌿🌸\n\nServices included:\n• Lawn mowing & maintenance\n• Flower bed design\n• Garden lighting installation\n\nContact us for a free consultation!',
      images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800'],
      videos: [],
      likes: 124,
      shares: 34,
    },
    {
      authorId: artisanUsers[4].id,
      content: 'Custom kitchen cabinet installation completed in Ibadan! 🪵\n\nUsed locally sourced hardwood for durability. The client wanted a traditional Nigerian design with modern functionality.\n\n#Carpentry #WoodworkNigeria #CustomFurniture',
      images: ['https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
      videos: [],
      likes: 89,
      shares: 18,
    },
    {
      authorId: artisanUsers[5].id,
      content: 'Fresh coat of paint transforms this house in Enugu! 🎨\n\nUsed premium weather-resistant paint for the exterior. Interior got a modern minimalist touch.\n\nFree estimates available - contact us today!',
      images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800'],
      videos: [],
      likes: 67,
      shares: 15,
    },
  ];

  for (const post of postsData) {
    await prisma.post.create({
      data: {
        authorId: post.authorId,
        content: post.content,
        images: post.images,
        videos: post.videos,
        likes: post.likes,
        shares: post.shares,
        visibility: 'public',
      },
    });
  }
  console.log(`  ✓ ${postsData.length} posts created`);

  // Create announcements
  console.log('\n📢 Creating announcements...');
  const announcements = [
    { title: 'Welcome to Workers-Choice Nigeria!', content: 'Your trusted marketplace for local artisans and services. Find verified professionals in Lagos, Abuja, Port Harcourt, and across Nigeria.', type: 'news' },
    { title: 'New Feature: Before/After Photos', content: 'Providers can now upload before and after photos of completed jobs for transparency and trust.', type: 'update' },
    { title: 'Independence Day Flash Sale', content: '10% off all services this weekend! Use code NAIJA10 at checkout.', type: 'promo' },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: {
        ...announcement,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${announcements.length} announcements created`);

  // Summary
  console.log('\n========================================');
  console.log('🎉 Database seed completed successfully!');
  console.log('========================================\n');
  console.log('📊 Summary:');
  console.log('  • 1 Admin user');
  console.log(`  • ${artisanUsers.length} Artisan users`);
  console.log(`  • ${sellerUsers.length} Seller users`);
  console.log(`  • ${customerUsers.length} Customer users`);
  console.log(`  • ${servicesData.length} Services`);
  console.log(`  • ${productsData.length} Products`);
  console.log(`  • ${orders.length} Orders`);
  console.log('  • 1 Review');
  console.log(`  • ${messages.length} Messages`);
  console.log(`  • ${groups.length} Skill Groups`);
  console.log(`  • ${joinRequests.length} Join Requests`);
  console.log(`  • ${announcements.length} Announcements`);
  console.log('\n🔐 Default password for all users: password123');
  console.log('🔐 Admin password: mpanshak-112706');
  console.log('\n📧 Test accounts:');
  console.log('  Admin:    mpanshak@gmail.com');
  console.log('  Artisan:  chinedu.plumber@example.com');
  console.log('  Seller:   kemi.store@example.com');
  console.log('  Customer: tunde.customer@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
