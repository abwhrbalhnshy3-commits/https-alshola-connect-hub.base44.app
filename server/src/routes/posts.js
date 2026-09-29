const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const postInclude = {
  user: { select: { id: true, name: true, username: true, avatar: true } },
  likes: { select: { userId: true } },
  comments: {
    include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  },
};

router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({
    include: postInclude,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ posts });
});

router.post('/', auth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'لا يمكن نشر منشور فارغ' });
  }

  const post = await prisma.post.create({
    data: { content: content.trim(), userId: req.userId },
    include: postInclude,
  });
  res.json({ post });
});

router.post('/:id/like', auth, async (req, res) => {
  const postId = parseInt(req.params.id);

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: req.userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    res.json({ liked: false });
  } else {
    await prisma.like.create({ data: { userId: req.userId, postId } });
    res.json({ liked: true });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'التعليق لا يمكن أن يكون فارغاً' });
  }

  const comment = await prisma.comment.create({
    data: { content: content.trim(), userId: req.userId, postId: parseInt(req.params.id) },
    include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
  });
  res.json({ comment });
});

module.exports = router;
