const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// These specific routes must come before /:id to avoid conflicts
router.put('/profile', auth, async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, bio, avatar },
    select: { id: true, name: true, username: true, email: true, bio: true, avatar: true },
  });
  res.json({ user });
});

router.get('/suggestions/all', auth, async (req, res) => {
  const followingIds = await prisma.follow.findMany({
    where: { followerId: req.userId },
    select: { followingId: true },
  });
  const excludeIds = [req.userId, ...followingIds.map((f) => f.followingId)];

  const users = await prisma.user.findMany({
    where: { id: { notIn: excludeIds } },
    select: { id: true, name: true, username: true, avatar: true, bio: true },
    take: 5,
  });
  res.json({ users });
});

router.get('/search/all', auth, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, username: true, avatar: true, bio: true },
    take: 20,
  });
  res.json({ users });
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    select: {
      id: true, name: true, username: true, bio: true, avatar: true, createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json({ user });
});

router.get('/:id/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { userId: parseInt(req.params.id) },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
      likes: { select: { userId: true } },
      comments: {
        include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ posts });
});

router.post('/:id/follow', auth, async (req, res) => {
  const followingId = parseInt(req.params.id);
  if (followingId === req.userId) {
    return res.status(400).json({ error: 'لا يمكنك متابعة نفسك' });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.userId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    res.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId: req.userId, followingId } });
    res.json({ following: true });
  }
});

router.get('/:id/isFollowing', auth, async (req, res) => {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.userId, followingId: parseInt(req.params.id) } },
  });
  res.json({ following: !!existing });
});

router.get('/:id/followers', async (req, res) => {
  const follows = await prisma.follow.findMany({
    where: { followingId: parseInt(req.params.id) },
    include: { follower: { select: { id: true, name: true, username: true, avatar: true, bio: true } } },
  });
  res.json({ users: follows.map((f) => f.follower) });
});

router.get('/:id/following', async (req, res) => {
  const follows = await prisma.follow.findMany({
    where: { followerId: parseInt(req.params.id) },
    include: { following: { select: { id: true, name: true, username: true, avatar: true, bio: true } } },
  });
  res.json({ users: follows.map((f) => f.following) });
});

module.exports = router;
