const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  if (postCount > 0) {
    console.log('Data already seeded, skipping.');
    return;
  }

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

  const posts = await prisma.post.createMany({
    data: [
      { content: 'يوم جميل في الطبيعة 🌿 شاركتكم بعض الصور من رحلتي اليوم', userId: sara.id },
      { content: 'بدأت مشروع جديد باستخدام React و Node.js، متحمس جداً للنتيجة! 🚀', userId: omar.id },
      { content: 'أنجزت لوحة جديدة اليوم، ما رأيكم؟ 🎨', userId: layla.id },
      { content: 'السفر يفتح آفاقاً جديدة ويعلمنا الكثير عن العالم 🌍', userId: sara.id },
      { content: 'التقنية تغير العالم بسرعة، يجب أن نواكب التطور 💡', userId: omar.id },
      { content: 'الفن هو لغة المشاعر التي يفهمها الجميع ❤️', userId: layla.id },
    ],
  });

  // Add some likes and comments
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

  console.log('Seed completed successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
