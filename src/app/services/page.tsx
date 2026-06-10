"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Wrench, 
  Wifi, 
  Sparkles, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Info, 
  Plus, 
  Star, 
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 } 
  }
};

export default function ServicesPage() {
  const { requests, addRequest } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Rating State for past requests
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState(0);

  const activeRequests = requests.filter(r => r.status !== 'Resolved');
  const pastRequests = requests.filter(r => r.status === 'Resolved');

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'plumbing': return <Wrench className="size-5" />;
      case 'wi-fi':
      case 'wifi': return <Wifi className="size-5" />;
      case 'cleaning':
      case 'housekeeping': return <Sparkles className="size-5" />;
      case 'electrical': return <Zap className="size-5" />;
      default: return <FileText className="size-5" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'plumbing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15';
      case 'wi-fi':
      case 'wifi': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15';
      case 'cleaning':
      case 'housekeeping': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15';
      case 'electrical': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15';
      default: return 'bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-550/15';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    addRequest(category, title, description, priority);
    
    // Reset form
    setTitle('');
    setCategory('Plumbing');
    setPriority('Medium');
    setDescription('');
    setAttachedImage(null);
    setIsNewRequestOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRateSubmit = () => {
    if (ratingTarget) {
      setRatings(prev => ({ ...prev, [ratingTarget]: tempRating }));
      setRatingTarget(null);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Service Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track and manage your maintenance tickets.
          </p>
        </div>
        
        {/* Desktop New Request Button */}
        <Button 
          onClick={() => setIsNewRequestOpen(true)}
          className="hidden md:flex bg-primary hover:bg-primary/95 glow-primary font-bold items-center gap-2 rounded-xl cursor-pointer"
        >
          <Plus className="size-4" />
          Raise Request
        </Button>
      </motion.div>

      {/* Tabs list */}
      <Tabs 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as 'active' | 'past')}
        className="w-full flex flex-col gap-5"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center bg-white/40 dark:bg-slate-950/20 p-1 rounded-[16px] border border-white/20 dark:border-white/5 w-full sm:w-max">
          <TabsList className="bg-transparent flex gap-1 p-0 h-auto">
            <TabsTrigger 
              value="active" 
              className="px-6 py-2 text-xs font-bold rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm cursor-pointer"
            >
              Active ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="px-6 py-2 text-xs font-bold rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm cursor-pointer"
            >
              Past ({pastRequests.length})
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* Tab 1: Active Requests */}
        <TabsContent value="active" className="outline-none flex flex-col gap-4 m-0">
          {activeRequests.length === 0 ? (
            <Card className="glass-card border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-12 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-105 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">No Active Tickets</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    Everything in your room is in top shape! Click &quot;Raise Request&quot; if you need anything fixed.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.map((req) => {
                const progressWidth = req.status === 'Open' ? '15%' : '50%';
                
                return (
                  <Card 
                    key={req.id} 
                    className="glass-card border-transparent shadow-none rounded-3xl flex flex-col justify-between overflow-hidden"
                  >
                    <CardContent className="p-5 flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${getCategoryColor(req.category)}`}>
                            {getCategoryIcon(req.category)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{req.title}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                              Req #{req.id.toUpperCase().slice(0, 5)} • Raised {req.raisedDate}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${
                          req.status === 'Open' 
                            ? 'bg-slate-100/60 text-slate-600 dark:bg-slate-900 dark:text-slate-300' 
                            : 'bg-primary/10 text-primary dark:text-primary'
                        } border-transparent text-[10px] font-black py-0.5 px-2.5 rounded-full`}>
                          {req.status}
                        </Badge>
                      </div>

                      {/* Timeline */}
                      <div className="relative py-4 px-2">
                        <div className="absolute top-[21px] left-[20px] right-[20px] h-[3px] bg-slate-100 dark:bg-slate-800 rounded-full" />
                        <div 
                          className="absolute top-[21px] left-[20px] h-[3px] bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 glow-primary" 
                          style={{ width: `calc(${progressWidth} - 40px)` }}
                        />
                        <div className="flex justify-between relative z-10">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-white dark:ring-slate-950 shadow-md" />
                            <span className="text-[9px] font-bold text-slate-900 dark:text-white">Raised</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-950 ${
                              req.status !== 'Open' ? 'bg-primary shadow-md' : 'bg-slate-205 dark:bg-slate-800'
                            }`} />
                            <span className={`text-[9px] font-bold ${
                              req.status !== 'Open' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                            }`}>Assigned</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-205 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-950" />
                            <span className="text-[9px] font-bold text-slate-400">Resolved</span>
                          </div>
                        </div>
                      </div>

                      {/* Info context message */}
                      <div className="mt-3 bg-white/40 dark:bg-slate-950/20 p-3 rounded-2xl border border-white/20 dark:border-white/5 flex gap-2.5 items-start">
                        <Info className="size-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Latest Update:</span>{' '}
                          {req.status === 'Open'
                            ? "Ticket received. Staff will assign a technician shortly."
                            : "Technician is scheduled to resolve the issue soon."
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Past Requests */}
        <TabsContent value="past" className="outline-none flex flex-col gap-4 m-0">
          {pastRequests.length === 0 ? (
            <Card className="glass-card border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-12 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">No Past Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    No past service requests found for your room.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastRequests.map((req) => {
                const currentRating = ratings[req.id] || 0;
                
                return (
                  <Card 
                    key={req.id} 
                    className="glass-card border-transparent shadow-none rounded-3xl flex flex-col justify-between"
                  >
                    <CardContent className="p-5 flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${getCategoryColor(req.category)}`}>
                            {getCategoryIcon(req.category)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{req.title}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                              Completed • Raised {req.raisedDate}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[10px] font-bold py-0.5 px-2.5 rounded-full">
                          Resolved
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {req.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100/40 dark:border-slate-800/40 flex justify-between items-center mt-auto">
                        {/* Rating display */}
                        {currentRating > 0 ? (
                          <div className="flex gap-0.5 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`size-3.5 ${
                                  star <= currentRating 
                                    ? 'text-amber-500 fill-amber-500' 
                                    : 'text-slate-200 dark:text-slate-800'
                                }`} 
                              />
                            ))}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-semibold">Rated</span>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary hover:text-primary/95 text-[11px] h-8 font-extrabold p-0 flex items-center gap-1.5 cursor-pointer"
                            onClick={() => {
                              setRatingTarget(req.id);
                              setTempRating(0);
                            }}
                          >
                            <Star className="size-3.5" />
                            Rate Service
                          </Button>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          Closed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => setIsNewRequestOpen(true)}
        className="md:hidden fixed bottom-22 right-6 w-14 h-14 bg-primary text-white rounded-[20px] shadow-[0_8px_24px_rgba(88,67,233,0.35)] flex items-center justify-center hover:bg-primary/95 active:scale-95 transition-all z-40 group cursor-pointer glow-primary border border-white/20"
      >
        <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Dialog for Raising Request */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Raise Service Request</DialogTitle>
            <DialogDescription className="text-xs text-slate-550 mt-1">
              Submit a maintenance request for room repairs or connectivity issues.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</Label>
              <select 
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Wi-Fi">Wi-Fi & Internet</option>
                <option value="Cleaning">Cleaning & Housekeeping</option>
                <option value="Electrical">Electrical</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Request Title</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken shower knob, Router blinking red"
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Urgency Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      priority === level 
                        ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Description</Label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail, including specific locations in the room."
                required
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Photo upload block */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Attachment (Optional)</Label>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2 relative min-h-[96px] cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-900/50 transition-colors">
                {attachedImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden">
                    <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-black/80 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="size-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Upload issue image (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs rounded-xl cursor-pointer">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingTarget !== null} onOpenChange={(open) => !open && setRatingTarget(null)}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-base font-bold">Rate Service</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 text-center">
              How would you rate the resolution of this issue?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                className="hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                onClick={() => setTempRating(star)}
              >
                <Star 
                  className={`size-7 ${
                    star <= tempRating 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-slate-205 dark:text-slate-800'
                  }`} 
                />
              </button>
            ))}
          </div>

          <DialogFooter className="w-full flex gap-2 sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 text-xs rounded-xl cursor-pointer"
              onClick={() => setRatingTarget(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="flex-1 bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer"
              onClick={handleRateSubmit}
              disabled={tempRating === 0}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
