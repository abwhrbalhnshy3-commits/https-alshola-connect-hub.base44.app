const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const REACTION_TYPES = new Set(['like', 'love', 'laugh', 'wow', 'sad', 'angry']);

const postInclude = {
  user: { select: { id: true, name: true, username: true, avatar: true } },
  likes: { select: { userId: true, type: true } },
  comments: {
    include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  },
};

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get('/', async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({ include: postInclude, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

router.get('/following', auth, async (req, res, next) => {
  try {
    const following = await prisma.follow.findMany({ where: { followerId: req.userId }, select: { followingId: true } });
    const followingIds = [...following.map((f) => f.followingId), req.userId];
    const posts = await prisma.post.findMany({
      where: { userId: { in: followingIds } },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'لا يمكن نشر منشور فارغ' });
    const post = await prisma.post.create({ data: { content: content.trim(), userId: req.userId }, include: postInclude });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// Backward-compatible like toggle for existing clients.
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'رقم المنشور غير صالح' });
    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: req.userId, postId } } });
    if (existing?.type === 'like') {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false, reaction: null });
    }
    const reaction = existing
      ? await prisma.like.update({ where: { id: existing.id }, data: { type: 'like' } })
      : await prisma.like.create({ data: { userId: req.userId, postId, type: 'like' } });
    res.json({ liked: true, reaction: reaction.type });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reaction', auth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    const type = String(req.body.type || '').toLowerCase();
    if (!postId || !REACTION_TYPES.has(type)) return res.status(400).json({ error: 'نوع التفاعل غير صالح' });

    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: req.userId, postId } } });
    if (existing?.type === type) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ reaction: null });
    }
    const reaction = existing
      ? await prisma.like.update({ where: { id: existing.id }, data: { type } })
      : await prisma.like.create({ data: { userId: req.userId, postId, type } });
    res.json({ reaction: reaction.type });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    const { content } = req.body;
    if (!postId) return res.status(400).json({ error: 'رقم المنشور غير صالح' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'التعليق لا يمكن أن يكون فارغاً' });
    const comment = await prisma.comment.create({
      data: { content: content.trim(), userId: req.userId, postId },
      include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    });
    res.json({ comment });
  } catch (err) {
    next(err);
  }
});

router.delete('/:postId/comments/:commentId', auth, async (req, res, next) => {
  try {
    const commentId = parseId(req.params.commentId);
    if (!commentId) return res.status(400).json({ error: 'رقم التعليق غير صالح' });
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: 'التعليق غير موجود' });
    if (comment.userId !== req.userId) return res.status(403).json({ error: 'لا يمكنك حذف تعليق شخص آخر' });
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'المنشور غير موجود' });
    if (post.userId !== req.userId) return res.status(403).json({ error: 'لا يمكنك حذف منشور شخص آخر' });
    await prisma.post.delete({ where: { id: postId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
