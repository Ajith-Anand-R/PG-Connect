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
  Image as ImageIcon
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

  const [feed, setFeed] = useState<FeedPost[]>([]);



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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Community Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stay updated and connect with neighbors.
          </p>
        </div>
        <Button 
          onClick={() => setIsNewPostOpen(true)}
          className="bg-primary font-bold flex items-center gap-2"
        >
          <Plus className="size-4" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Official Notices */}
        <section className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Volume2 className="size-5 text-primary" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Official Notices</h2>
          </div>

          <div className="flex flex-col gap-4">
            {notices.map((notice) => {
              const isUrgent = notice.category === 'Maintenance';
              return (
                <Card 
                  key={notice.id} 
                  className={`border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden ${
                    isUrgent ? 'border-l-4 border-l-destructive' : ''
                  }`}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {isUrgent && (
                      <div className="absolute -right-2 -top-2 opacity-5 pointer-events-none">
                        <AlertTriangle className="size-16 text-destructive" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start">
                      <Badge className={`${
                        isUrgent 
                          ? 'bg-destructive/10 text-destructive' 
                          : notice.category === 'Event'
                          ? 'bg-primary/10 text-primary dark:text-primary'
                          : 'bg-secondary/10 text-secondary'
                      } border-transparent text-[10px] font-bold py-0.5 px-2 rounded-full`}>
                        {notice.category}
                      </Badge>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {notice.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{notice.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>

                    <button 
                      onClick={() => setSelectedNotice(notice)}
                      className="mt-1 text-xs font-bold text-primary hover:underline flex items-center gap-0.5 w-max"
                    >
                      Read full notice <ChevronRight className="size-3.5" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Right Column: Resident Feed */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-secondary" />
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Resident Feed</h2>
            </div>

            {/* Simple filters */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              {(['all', 'marketplace', 'discussion'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeedTab(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeFeedTab === tab 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'marketplace' ? 'Market' : 'Discuss'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredFeed.map((post) => {
              const hasImage = !!post.image;
              
              return (
                <Card 
                  key={post.id}
                  className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    {/* Post Author Info */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                          {post.avatar ? (
                            <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                          ) : (
                            post.author.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{post.author}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{post.room} • {post.time}</p>
                        </div>
                      </div>

                      <Badge className={`${
                        post.category === 'Marketplace' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      } border-transparent text-[10px] font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1`}>
                        {post.category === 'Marketplace' && <ShoppingBag className="size-3" />}
                        {post.type}
                      </Badge>
                    </div>

                    {/* Post Content */}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{post.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Image Attachment */}
                    {hasImage && (
                      <div className="w-full h-48 rounded-xl overflow-hidden mt-1 border border-slate-100 dark:border-slate-800">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Likes & Comments Summary */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          post.likedByMe ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`size-4 ${post.likedByMe ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likes} Likes</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="size-4" />
                        <span>{post.comments.length} Comments</span>
                      </div>
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl flex flex-col gap-3 mt-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2.5 items-start">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-600 shrink-0">
                              {comment.avatar ? (
                                <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                              ) : (
                                comment.author.split(' ').map(n => n[0]).join('')
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                                {comment.author}
                                <span className="font-normal text-slate-400 ml-1.5">{comment.time}</span>
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-normal">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-400">
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
                          className="w-full rounded-full pl-4 pr-10 text-xs h-9 bg-slate-50 dark:bg-slate-900/60"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="absolute right-2.5 text-primary hover:text-primary-container p-1 rounded-full"
                        >
                          <Send className="size-4" />
                        </button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="max-w-md w-full p-6">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center gap-2 mb-2">
                  <Badge className={`${
                    selectedNotice.category === 'Maintenance' 
                      ? 'bg-destructive/10 text-destructive' 
                      : selectedNotice.category === 'Event'
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'bg-secondary/10 text-secondary'
                  } border-transparent text-[10px] font-bold py-0.5 px-2 rounded-full`}>
                    {selectedNotice.category}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">{selectedNotice.date}</span>
                </div>
                <DialogTitle className="text-lg font-bold">{selectedNotice.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                {selectedNotice.content}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3 mt-4 items-start">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  For any concerns regarding this notice, please contact the building management office at block A reception.
                </p>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose render={<Button className="w-full bg-primary font-bold text-xs">Acknowledge</Button>} />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Community Post</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Share details about an item you are selling, or ask a question to neighbors.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-category" className="text-xs font-bold text-slate-700 dark:text-slate-300">Post Category</Label>
              <select 
                id="post-category"
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as 'Marketplace' | 'Discussion')}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                className="w-full text-xs"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Photo attachment for sell post */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Attach Photo (Optional)</Label>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex flex-col items-center justify-center gap-2 relative min-h-[100px]">
                {postImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img src={postImage} alt="Post preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setPostImage(null)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-black/70 font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="size-6 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">Select post image</span>
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

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary text-xs font-bold">
                Publish Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
