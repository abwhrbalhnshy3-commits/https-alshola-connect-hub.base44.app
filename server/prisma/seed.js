const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  if (postCount > 0) {
    console.log('Posts already seeded, skipping post seed.');
  } else {
    await seedPosts();
  }

  await seedMessages();
  console.log('Seed completed successfully.');
}

async function seedPosts() {
  const password = await bcrypt.hash('password123', 10);

  const [sara, omar, layla] = await Promise.all([
    prisma.user.create({
      data: { name: 'سارة أحمد', username: 'sara', email: 'demo@alshola.app', password, bio: 'مرحباً! أنا سارة، أحب التصوير والسفر 📸✈️' }
    }),
    prisma.user.create({
      data: { name: 'عمر خالد', username: 'omar', email: 'omar@alshola.app', password, bio: 'مطور برمجيات ومحب للتقنية 💻' }
    }),
    prisma.user.create({
      data: { name: 'ليلى محمد', username: 'layla', email: 'layla@alshola.app', password, bio: 'فنانة ورسامة 🎨' }
    }),
  ]);

  await prisma.post.createMany({
    data: [
      { content: 'يوم جميل في الطبيعة 🌿 شاركتكم بعض الصور من رحلتي اليوم', userId: sara.id },
      { content: 'بدأت مشروع جديد باستخدام React و Node.js، متحمس جداً للنتيجة! 🚀', userId: omar.id },
      { content: 'أنجزت لوحة جديدة اليوم، ما رأيكم؟ 🎨', userId: layla.id },
      { content: 'السفر يفتح آفاقاً جديدة ويعلمنا الكثير عن العالم 🌍', userId: sara.id },
      { content: 'التقنية تغير العالم بسرعة، يجب أن نواكب التطور 💡', userId: omar.id },
      { content: 'الفن هو لغة المشاعر التي يفهمها الجميع ❤️', userId: layla.id },
    ],
  });

  const allPosts = await prisma.post.findMany();
  if (allPosts.length >= 2) {
    await prisma.like.createMany({
      data: [
        { userId: omar.id, postId: allPosts[0].id },
        { userId: layla.id, postId: allPosts[0].id },
        { userId: sara.id, postId: allPosts[1].id },
      ],
      skipDuplicates: true,
    });
    await prisma.comment.createMany({
      data: [
        { content: 'صور رائعة! 🌟', userId: omar.id, postId: allPosts[0].id },
        { content: 'بالتوفيق في المشروع الجديد 👏', userId: sara.id, postId: allPosts[1].id },
      ],
    });
  }
}

async function seedMessages() {
  const existingMsgs = await prisma.message.count();
  if (existingMsgs > 0) {
    console.log('Messages already seeded, skipping.');
    return;
  }

  const [sara, omar, layla] = await Promise.all([
    prisma.user.findUnique({ where: { username: 'sara' }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: 'omar' }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: 'layla' }, select: { id: true } }),
  ]);

  if (!sara || !omar || !layla) return;

  await prisma.message.createMany({
    data: [
      { content: 'مرحباً عمر! كيف حالك؟', senderId: sara.id, receiverId: omar.id },
      { content: 'أهلاً سارة! أنا بخير الحمد لله، وأنتِ؟', senderId: omar.id, receiverId: sara.id },
      { content: 'بخير، سمعت عن مشروعك الجديد، مبارك! 🎉', senderId: sara.id, receiverId: omar.id },
      { content: 'شكراً جزيلاً! 🙏 سأشارككم التفاصيل قريباً', senderId: omar.id, receiverId: sara.id },
      { content: 'مرحباً ليلى، أحببت لوحتك الجديدة كثيراً', senderId: sara.id, receiverId: layla.id },
      { content: 'شكراً سارة! هذا يعني لي الكثير ❤️', senderId: layla.id, receiverId: sara.id },
    ],
  });
  console.log('Sample messages seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
