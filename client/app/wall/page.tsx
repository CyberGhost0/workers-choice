'use client';

'use client';

import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  MoreHorizontal,
  Bookmark,
  Globe,
  Users,
  X,
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    businessName?: string;
    role: string;
  };
  content: string;
  images: string[];
  videos: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

// Mock data for demonstration with real images (falls back when API is unavailable)
// Each post has 2 images: [0]="before" state, [1]="after" (completed, cleaner result)
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'a1',
      name: 'Chinedu Okonkwo',
      businessName: 'Chinedu Plumbing Services',
      role: 'ARTISAN',
    },
    content: 'Just completed this beautiful bathroom renovation in Lagos! The client wanted a modern look with matte black fixtures. What do you think? 🛁✨\n\n#Plumbing #LagosArtisan #BathroomRenovation',
    images: ['https://images.unsplash.com/photo-1632214531975-b4c9198c01f8?w=800', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800'],
    videos: [],
    likes: 45,
    comments: [
      {
        id: 'c1',
        author: { name: 'Tunde Bakare' },
        content: 'Looks amazing! Great work as always, Chinedu!',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'c2',
        author: { name: 'Adedayo Oladipo' },
        content: 'The fixtures look top notch! Very professional.',
        createdAt: '2024-01-15T11:45:00Z',
      },
    ],
    shares: 12,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    author: {
      id: 'a2',
      name: 'Fatima Abubakar',
      businessName: 'Spotless Cleaning Co.',
      role: 'ARTISAN',
    },
    content: 'Before and after of today\'s deep cleaning job in Abuja! Nothing satisfies us more than seeing a space transform from messy to spotless. 🧹✨\n\n#CleaningService #BeforeAndAfter #AbujaCleaning',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800'],
    videos: [],
    likes: 78,
    comments: [
      {
        id: 'c3',
        author: { name: 'Chidinma Okafor' },
        content: 'Incredible transformation! How long did this take?',
        createdAt: '2024-01-14T14:20:00Z',
      },
    ],
    shares: 23,
    isLiked: true,
    isSaved: true,
    createdAt: '2024-01-14T12:00:00Z',
  },
  {
    id: '3',
    author: {
      id: 'a3',
      name: 'Kemi Adekunle',
      businessName: 'Kemi Home Essentials',
      role: 'SELLER',
    },
    content: '🎉 NEW ARRIVAL! Premium 100-piece tool set now available! Perfect for DIY enthusiasts and professionals alike. Get yours today - special launch price! 🔧\n\n• Chrome vanadium steel\n• Durable carrying case\n• Lifetime warranty\n• Delivery available nationwide',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800'],
    videos: [],
    likes: 156,
    comments: [],
    shares: 45,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-13T18:00:00Z',
  },
  {
    id: '4',
    author: {
      id: 'a4',
      name: 'Adeola Johnson',
      businessName: 'PowerFix Electrical',
      role: 'ARTISAN',
    },
    content: '💡 Tip of the day: If your circuit breaker keeps tripping, don\'t ignore it! It could be a sign of overloaded circuits, faulty wiring, or a damaged appliance. Always consult a licensed electrician for safety.\n\nNeed electrical help? Book a free inspection today! We serve Lagos, Abuja, and Port Harcourt.',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    videos: [],
    likes: 92,
    comments: [
      {
        id: 'c4',
        author: { name: 'Bolaji Adebayo' },
        content: 'Great advice! Safety first. 🔌',
        createdAt: '2024-01-12T16:00:00Z',
      },
    ],
    shares: 67,
    isLiked: false,
    isSaved: true,
    createdAt: '2024-01-12T14:00:00Z',
  },
  {
    id: '5',
    author: {
      id: 'a5',
      name: 'Grace Nwosu',
      businessName: 'Green Garden Landscaping',
      role: 'ARTISAN',
    },
    content: 'Transformed this compound in Port Harcourt into a beautiful garden paradise! 🌿🌸\n\nServices included:\n• Lawn mowing & maintenance\n• Flower bed design\n• Garden lighting installation\n\nContact us for a free consultation!',
    images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800'],
    videos: [],
    likes: 124,
    comments: [
      {
        id: 'c5',
        author: { name: 'Ngozi Eze' },
        content: 'This is beautiful! How much for a similar project?',
        createdAt: '2024-01-11T09:15:00Z',
      },
    ],
    shares: 34,
    isLiked: true,
    isSaved: false,
    createdAt: '2024-01-11T08:00:00Z',
  },
];

export default function WallPage() {
  const { user } = useAuth();
  const canPost =
    user?.role === 'ARTISAN' || user?.role === 'SELLER' || user?.role === 'ADMIN';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      const data = res.data;
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setPosts(mockPosts);
      }
    } catch {
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  const handleShare = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
    // In real app, would open share dialog
    alert('Post shared!');
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: {
        name: user.profile?.fullName || 'User',
        avatar: user.profile?.avatarUrl,
      },
      content: commentText,
      createdAt: new Date().toISOString(),
    };

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    setCommentText('');
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user || !canPost) return;

    const newPost: Post = {
      id: `p${Date.now()}`,
      author: {
        id: user.id,
        name: user.profile?.fullName || 'User',
        avatar: user.profile?.avatarUrl,
        businessName: user.businessProfile?.businessName,
        role: user.role,
      },
      content: newPostContent,
      images: [],
      videos: [],
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Create Post Box - providers (artisans/sellers) only */}
          {canPost ? (
            <div className="bg-card rounded-xl shadow-sm border p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {user?.profile?.avatarUrl ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {user ? getInitials(user.profile?.fullName || 'U') : '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="w-full text-left px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    What&apos;s on your mind?
                  </button>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPostModal(true)}
                    >
                      <ImageIcon className="h-4 w-4 mr-2 text-green-500" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPostModal(true)}
                    >
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                      Video
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPostModal(true)}
                    >
                      <FileText className="h-4 w-4 mr-2 text-orange-500" />
                      Article
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-sm border p-4 mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                {user
                  ? 'Only service providers and sellers can create posts. You can like and comment on posts below.'
                  : 'Sign in as a provider or seller to share posts. You can still browse the feed below.'}
              </p>
              {!user && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <a href="/auth/login">
                    <Button size="sm" variant="outline">Sign In</Button>
                  </a>
                  <a href="/auth/register?role=artisan">
                    <Button size="sm">Become a Provider</Button>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                {/* Post Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {getInitials(post.author.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.author.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {post.author.businessName && (
                            <span>{post.author.businessName}</span>
                          )}
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More post options</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className={`${post.images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                    {post.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-video bg-muted flex items-center justify-center overflow-hidden"
                      >
                        <ImageCarousel images={[img]} alt={`Post image ${idx + 1}`} className="w-full h-full" interval={5000} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Videos */}
                {post.videos.length > 0 && (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Video</p>
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b">
                  <div className="flex items-center gap-1">
                    <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Heart className="h-3 w-3 text-white fill-white" />
                    </span>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{post.comments.length} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-2 flex items-center justify-between border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${post.isLiked ? 'text-primary' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart
                      className={`h-5 w-5 mr-2 ${post.isLiked ? 'fill-primary' : ''}`}
                    />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPost(post)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Comment
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={post.isSaved ? 'text-primary' : ''}
                        onClick={() => handleSave(post.id)}
                      >
                        <Bookmark
                          className={`h-5 w-5 ${post.isSaved ? 'fill-primary' : ''}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{post.isSaved ? 'Remove from saved' : 'Save post'}</TooltipContent>
                  </Tooltip>
                </div>

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="p-4 space-y-3">
                    {post.comments.slice(-2).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">
                            {getInitials(comment.author.name)}
                          </span>
                        </div>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                          <p className="text-sm font-medium">{comment.author.name}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <button
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedPost(post)}
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                )}

                {/* Add Comment - logged-in users only */}
                {user ? (
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {getInitials(user.profile?.fullName || 'U')}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && post.id) {
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Submit comment</TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="p-4 pt-0">
                    <a href="/auth/login">
                      <button className="text-sm text-primary hover:underline">
                        Sign in to comment
                      </button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Post</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewPostModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user ? getInitials(user.profile?.fullName || 'U') : '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user?.profile?.fullName}</p>
                  <select className="text-xs bg-muted rounded px-2 py-1">
                    <option value="public">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Public
                    </option>
                    <option value="followers">
                      <Users className="h-3 w-3 inline mr-1" />
                      Followers Only
                    </option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full min-h-[150px] resize-none border-0 bg-transparent focus:outline-none text-lg"
              />
              <div className="flex items-center gap-2 pt-4 border-t">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5 mr-2 text-green-500" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="h-5 w-5 mr-2 text-blue-500" />
                  Video
                </Button>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button
                className="w-full"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Post by {selectedPost.author.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPost(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-4">
              <p className="whitespace-pre-wrap mb-4">{selectedPost.content}</p>
              
              {/* All Comments */}
              <div className="space-y-3">
                <h3 className="font-medium">Comments ({selectedPost.comments.length})</h3>
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {getInitials(comment.author.name)}
                      </span>
                    </div>
                    <div className="flex-1 bg-muted rounded-lg p-3">
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment(selectedPost.id);
                    setSelectedPost({
                      ...selectedPost,
                      comments: [
                        ...selectedPost.comments,
                        {
                          id: `c${Date.now()}`,
                          author: {
                            name: user?.profile?.fullName || 'Anonymous',
                            avatar: user?.profile?.avatarUrl,
                          },
                          content: commentText,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    });
                  }
                }}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => {
                      if (commentText.trim()) {
                        handleAddComment(selectedPost.id);
                        setSelectedPost({
                          ...selectedPost,
                          comments: [
                            ...selectedPost.comments,
                            {
                              id: `c${Date.now()}`,
                              author: {
                                name: user?.profile?.fullName || 'Anonymous',
                                avatar: user?.profile?.avatarUrl,
                              },
                              content: commentText,
                              createdAt: new Date().toISOString(),
                            },
                          ],
                        });
                      }
                    }}
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Submit comment</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
