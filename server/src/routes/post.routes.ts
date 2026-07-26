import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate, requireActiveStatus } from '../middleware/auth';

const router = Router();

// Get all posts (public)
router.get('/', async (req: any, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { visibility: 'public' },
      include: {
        author: {
          include: {
            profile: true,
            businessProfile: true,
          },
        },
        comments: {
          include: {
            author: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      author: {
        id: post.author.id,
        name: post.author.profile?.fullName || 'User',
        avatar: post.author.profile?.avatarUrl,
        businessName: post.author.businessProfile?.businessName,
        role: post.author.role,
      },
      content: post.content,
      images: post.images,
      videos: post.videos,
      likes: post.likes,
      comments: post.comments.map((c) => ({
        id: c.id,
        author: {
          name: c.author.profile?.fullName || 'User',
          avatar: c.author.profile?.avatarUrl,
        },
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      shares: post.shares,
      isLiked: false,
      isSaved: false,
      createdAt: post.createdAt.toISOString(),
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a post (authenticated)
router.post('/', authenticate, requireActiveStatus, async (req: any, res) => {
  try {
    const { content, images, videos } = req.body;

    const post = await prisma.post.create({
      data: {
        authorId: req.userId,
        content,
        images: images || [],
        videos: videos || [],
      },
    });

    res.status(201).json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like a post
router.post('/:id/like', authenticate, requireActiveStatus, async (req: any, res) => {
  try {
    const { id } = req.params;

    const existingLike = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId: req.userId } },
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      await prisma.post.update({ where: { id }, data: { likes: { decrement: 1 } } });
      res.json({ liked: false });
    } else {
      await prisma.postLike.create({ data: { postId: id, userId: req.userId } });
      await prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Add comment
router.post('/:id/comments', authenticate, requireActiveStatus, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId: req.userId,
        content,
      },
      include: {
        author: {
          include: { profile: true },
        },
      },
    });

    res.status(201).json({
      comment: {
        id: comment.id,
        author: {
          name: comment.author.profile?.fullName || 'User',
          avatar: comment.author.profile?.avatarUrl,
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
