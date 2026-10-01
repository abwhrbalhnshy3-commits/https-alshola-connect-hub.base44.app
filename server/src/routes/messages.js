const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// List conversations with last message + unread count
router.get('/conversations', auth, async (req, res) => {
  const sent = await prisma.message.findMany({
    where: { senderId: req.userId },
    select: { receiverId: true },
    distinct: ['receiverId'],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: req.userId },
    select: { senderId: true },
    distinct: ['senderId'],
  });

  const partnerIds = [
    ...new Set([
      ...sent.map((m) => m.receiverId),
      ...received.map((m) => m.senderId),
    ]),
  ];

  const conversations = await Promise.all(
    partnerIds.map(async (partnerId) => {
      const [lastMsg, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { senderId: req.userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: req.userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.message.count({
          where: { senderId: partnerId, receiverId: req.userId, read: false },
        }),
      ]);
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, username: true, avatar: true },
      });
      return { partner, lastMessage: lastMsg, unreadCount };
    })
  );

  conversations.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  res.json({ conversations });
});

// Get unread count (for badge) — must come before /:userId
router.get('/unread/count', auth, async (req, res) => {
  const count = await prisma.message.count({
    where: { receiverId: req.userId, read: false },
  });
  res.json({ count });
});

// Get messages between current user and partner
router.get('/:userId', auth, async (req, res) => {
  const partnerId = parseInt(req.params.userId);
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: req.userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: req.userId, read: false },
    data: { read: true },
  });

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, username: true, avatar: true },
  });

  res.json({ messages, partner });
});

// Send a message
router.post('/:userId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'الرسالة لا يمكن أن تكون فارغة' });
  }

  const receiverId = parseInt(req.params.userId);
  if (receiverId === req.userId) {
    return res.status(400).json({ error: 'لا يمكنك إرسال رسالة لنفسك' });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const message = await prisma.message.create({
    data: { content: content.trim(), senderId: req.userId, receiverId },
  });

  res.json({ message });
});

module.exports = router;
