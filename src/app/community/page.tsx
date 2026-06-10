"use client";

import React, { useState } from 'react';
import { useApp, Notice } from '@/context/AppContext';
import { 
  Volume2, 
  MessageSquare, 
  Plus, 
  Heart, 
  Send,
  AlertTriangle,
  ShoppingBag,
  Info,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 25 } 
  }
};

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface FeedPost {
  id: string;
  author: string;
  room: string;
  avatar: string;
  time: string;
  category: 'Marketplace' | 'Discussion';
  type: 'Selling' | 'Discussion';
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  likedByMe?: boolean;
}

export default function CommunityPage() {
  const { notices, tenant } = useApp();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'marketplace' | 'discussion'>('all');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  
  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'Marketplace' | 'Discussion'>('Discussion');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);

  // Comments inputs mapping (post.id -> string)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Seed with rich default community posts so it looks premium and alive
  const [feed, setFeed] = useState<FeedPost[]>([
    {
      id: "post-1",
      author: "Rahul Sharma",
      room: "Room 102",
      avatar: "",
      time: "2 hours ago",
      category: "Marketplace",
      type: "Selling",
      title: "Ergonomic Office Chair - Like New",
      content: "Selling my office chair. Adjustable armrests, lumbar support, and high-density foam seat. Used for 3 months, selling because I am relocating. Price is ₹2,500 (negotiable). DM if interested!",
      likes: 8,
      comments: [
        {
          id: "c-1",
          author: "Amit Verma",
          avatar: "",
          text: "Is it still available? I can check it out tonight.",
          time: "1 hour ago"
        },
        {
          id: "c-2",
          author: "Rahul Sharma",
          avatar: "",
          text: "Yes, Amit! Drop by Room 102 anytime after 7 PM.",
          time: "45 mins ago"
        }
      ]
    },
    {
      id: "post-2",
      author: "Sneha Reddy",
      room: "Room 204",
      avatar: "",
      time: "5 hours ago",
      category: "Discussion",
      type: "Discussion",
      title: "Cab sharing to Airport - Friday morning?",
      content: "Is anyone planning to take a cab to Bengaluru Airport on Friday morning around 5:30 AM? Hoping to pool and split the fare. Let me know if you want to join!",
      likes: 12,
      comments: [
        {
          id: "c-3",
          author: "Pooja Hegde",
          avatar: "",
          text: "Hey! I have a flight at 9 AM, so 5:30 AM is perfect. Add me in!",
          time: "3 hours ago"
        }
      ]
    },
    {
      id: "post-3",
      author: "Karan Malhotra",
      room: "Room 305",
      avatar: "",
      time: "1 day ago",
      category: "Discussion",
      type: "Discussion",
      title: "Lost gym bottle in block B lounge",
      content: "Hey guys, I think I left my black steel Decathlon water bottle in the Block B 3rd floor lounge yesterday evening. It has a red cap. If anyone found it, please ping me. Thanks!",
      likes: 4,
      comments: []
    }
  ]);

  const handleLike = (postId: string) => {
    setFeed(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          likedByMe: !post.likedByMe
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setFeed(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              author: tenant.name,
              avatar: '', // local avatar placeholder
              text: text.trim(),
              time: 'Just now'
            }
          ]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: tenant.name,
      room: tenant.room,
      avatar: '',
      time: 'Just now',
      category: postCategory,
      type: postCategory === 'Marketplace' ? 'Selling' : 'Discussion',
      title: postTitle.trim(),
      content: postContent.trim(),
      image: postImage || undefined,
      likes: 0,
      comments: []
    };

    setFeed(prev => [newPost, ...prev]);

    // Reset Form
    setPostTitle('');
    setPostCategory('Discussion');
    setPostContent('');
    setPostImage(null);
    setIsNewPostOpen(false);
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredFeed = feed.filter(post => {
    if (activeFeedTab === 'all') return true;
    return post.category.toLowerCase() === activeFeedTab;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Community Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with official bulletins and connect with your neighbors.
          </p>
        </div>
        <Button 
          onClick={() => setIsNewPostOpen(true)}
          className="bg-primary hover:bg-primary/95 font-bold flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl h-10 px-4"
        >
          <Plus className="size-4" />
          New Post
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Official Notices */}
        <motion.section variants={itemVariants} className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <Volume2 className="size-4.5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Official Notices</h2>
          </div>

          <div className="flex flex-col gap-4">
            {notices.map((notice) => {
              const isUrgent = notice.category === 'Maintenance';
              return (
                <div
                  key={notice.id} 
                  className={`glass-card glass-card-hover relative overflow-hidden rounded-3xl border-transparent ${
                    isUrgent ? 'border-l-4 border-l-rose-500 shadow-md shadow-rose-500/[0.02]' : ''
                  }`}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {isUrgent && (
                      <div className="absolute -right-3 -top-3 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-rose-500">
                        <AlertTriangle className="size-20" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Badge className={`${
                        isUrgent 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                          : notice.category === 'Event'
                          ? 'bg-primary/10 text-primary dark:text-primary border-primary/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                      } border text-[9px] font-bold py-0.5 px-2 rounded-md`}>
                        {notice.category}
                      </Badge>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {notice.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{notice.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>

                    <button 
                      onClick={() => setSelectedNotice(notice)}
                      className="mt-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 w-max"
                    >
                      Read full notice <ChevronRight className="size-3.5" />
                    </button>
                  </CardContent>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Right Column: Resident Feed */}
        <motion.section variants={itemVariants} className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <MessageSquare className="size-4.5" />
              </div>
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Resident Feed</h2>
            </div>

            {/* Filter tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              {(['all', 'marketplace', 'discussion'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeedTab(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeFeedTab === tab 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'all' ? 'All Feed' : tab === 'marketplace' ? 'Market' : 'Discussion'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFeed.map((post) => {
                const hasImage = !!post.image;
                
                return (
                  <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card rounded-3xl border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
                  >
                    <CardContent className="p-5 flex flex-col gap-4">
                      {/* Post Author Info */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {post.avatar ? (
                              <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                            ) : (
                              post.author.split(' ').map(n => n[0]).join('')
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{post.author}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{post.room} • {post.time}</p>
                          </div>
                        </div>

                        <Badge className={`${
                          post.category === 'Marketplace' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                            : 'bg-primary/10 text-primary dark:text-primary border-primary/20'
                        } border text-[9px] font-bold py-0.5 px-2 rounded-md flex items-center gap-1`}>
                          {post.category === 'Marketplace' && <ShoppingBag className="size-3" />}
                          {post.type}
                        </Badge>
                      </div>

                      {/* Post Content */}
                      <div className="flex flex-col gap-1.5">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">{post.title}</h4>
                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-normal">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Image Attachment */}
                      {hasImage && (
                        <div className="w-full h-52 rounded-2xl overflow-hidden mt-1 border border-slate-100 dark:border-slate-800 shadow-inner">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Likes & Comments Summary */}
                      <div className="flex items-center gap-5 pt-3.5 border-t border-slate-100/60 dark:border-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-all active:scale-90 ${
                            post.likedByMe ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`size-4.5 ${post.likedByMe ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{post.likes} Likes</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="size-4.5" />
                          <span>{post.comments.length} Comments</span>
                        </div>
                      </div>

                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="bg-slate-50/70 dark:bg-slate-900/30 p-3.5 rounded-2xl flex flex-col gap-3 mt-1.5 border border-slate-100/40 dark:border-slate-800/40">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start">
                              <div className="w-6.5 h-6.5 rounded-xl overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                                {comment.avatar ? (
                                  <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                ) : (
                                  comment.author.split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                                  {comment.author}
                                  <span className="font-normal text-slate-400 ml-1.5">{comment.time}</span>
                                </p>
                                <p className="text-xs text-slate-650 dark:text-slate-350 mt-0.5 leading-relaxed font-normal">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-primary/20 to-primary/30 text-primary dark:text-primary-foreground flex-shrink-0 flex items-center justify-center font-extrabold text-[10px] border border-primary/10">
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 relative flex items-center">
                          <Input 
                            placeholder="Write a comment..." 
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            className="w-full rounded-full pl-4.5 pr-11 text-xs h-9 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-primary/20"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="absolute right-2.5 text-primary hover:text-primary-container p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Send className="size-4" />
                          </button>
                        </div>
                      </div>

                    </CardContent>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="max-w-md w-full p-6 glass-card border-slate-150/40 dark:border-slate-800/40 rounded-3xl shadow-xl">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center gap-2 mb-1.5">
                  <Badge className={`${
                    selectedNotice.category === 'Maintenance' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                      : selectedNotice.category === 'Event'
                      ? 'bg-primary/10 text-primary dark:text-primary border-primary/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                  } border text-[9px] font-bold py-0.5 px-2 rounded-md`}>
                    {selectedNotice.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedNotice.date}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedNotice.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 text-xs text-slate-650 dark:text-slate-350 leading-relaxed border-t border-slate-100/60 dark:border-slate-800/60 pt-4 font-normal">
                {selectedNotice.content}
              </div>

              <div className="bg-primary/[0.02] dark:bg-primary/[0.04] p-3.5 rounded-2xl border border-primary/10 dark:border-primary/20 flex gap-3 mt-4 items-start">
                <Info className="size-4.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  For any questions or concerns regarding this update, please contact block A reception or raise a support ticket under the services section.
                </p>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose render={<Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs h-9.5 rounded-xl shadow-md shadow-primary/15 transition-all">Acknowledge</Button>} />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="max-w-md w-full p-6 glass-card border-slate-150/40 dark:border-slate-800/40 rounded-3xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="size-5 text-accent animate-pulse" />
              Create Community Post
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
              Share details about an item you are selling, or ask a question to neighbors. Please adhere to house guidelines.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-category" className="text-xs font-bold text-slate-700 dark:text-slate-300">Post Category</Label>
              <select 
                id="post-category"
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as 'Marketplace' | 'Discussion')}
                className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="Discussion">Discussion & Ask</option>
                <option value="Marketplace">Marketplace (Selling)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Headline</Label>
              <Input 
                id="post-title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g. Lost keys in lobby, Selling coffee table"
                required
                className="w-full text-xs h-9.5 rounded-xl border border-slate-250/50 dark:border-slate-800/50 focus-visible:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-content" className="text-xs font-bold text-slate-700 dark:text-slate-300">Message</Label>
              <textarea 
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post details here..."
                required
                rows={4}
                className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-250/50 dark:border-slate-800/50 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 resize-none transition-all"
              />
            </div>

            {/* Photo attachment for sell post */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Attach Photo (Optional)</Label>
              <div className="border border-dashed border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 relative min-h-[100px] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                {postImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img src={postImage} alt="Post preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setPostImage(null)}
                      className="absolute top-1.5 right-1.5 size-5.5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 font-bold transition-all"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="size-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Select post image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePostImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2 flex gap-2 w-full">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs h-9.5 rounded-xl border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs h-9.5 rounded-xl shadow-md shadow-primary/10 transition-all">
                Publish Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
