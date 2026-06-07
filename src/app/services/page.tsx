"use client";

import React, { useState } from 'react';
import { useApp, ServiceRequest } from '@/context/AppContext';
import { 
  Wrench, 
  Wifi, 
  Sparkles, 
  Zap, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Info, 
  Plus, 
  Star, 
  Image as ImageIcon,
  MessageSquare,
  AlertCircle
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
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [ratings, setRatings] = useState<Record<string, number>>({
    'req-2': 5
  });
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
      case 'plumbing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'wi-fi':
      case 'wifi': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      case 'cleaning':
      case 'housekeeping': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'electrical': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div className="flex flex-col gap-1.5 md:flex-row md:justify-between md:items-end">
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
          className="hidden md:flex bg-primary font-bold items-center gap-2"
        >
          <Plus className="size-4" />
          Raise Request
        </Button>
      </div>

      {/* Tabs list */}
      <Tabs 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as 'active' | 'past')}
        className="w-full flex flex-col gap-5"
      >
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 w-full sm:w-max">
          <TabsList className="bg-transparent flex gap-1">
            <TabsTrigger 
              value="active" 
              className="px-6 py-2 text-xs font-bold rounded-lg transition-all"
            >
              Active ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="px-6 py-2 text-xs font-bold rounded-lg transition-all"
            >
              Past ({pastRequests.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Active Requests */}
        <TabsContent value="active" className="outline-none flex flex-col gap-4">
          {activeRequests.length === 0 ? (
            <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-12">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">No Active Tickets</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    Everything in your room is in top shape! Click "Raise Request" if you need anything fixed.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.map((req, index) => {
                const isPlumbing = req.category.toLowerCase() === 'plumbing';
                const progressWidth = req.status === 'Open' ? '15%' : '50%';
                
                return (
                  <Card 
                    key={req.id} 
                    className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <CardContent className="p-5 flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${getCategoryColor(req.category)}`}>
                            {getCategoryIcon(req.category)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{req.title}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Req #{req.id.toUpperCase().slice(0, 5)} • Raised {req.raisedDate}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${
                          req.status === 'Open' 
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                            : 'bg-primary/10 text-primary dark:text-primary-fixed-dim'
                        } border-transparent text-[10px] font-bold py-0.5 px-2.5 rounded-full`}>
                          {req.status}
                        </Badge>
                      </div>

                      {/* Timeline */}
                      <div className="relative py-4">
                        <div className="absolute top-[21px] left-[16px] right-[16px] h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full" />
                        <div 
                          className="absolute top-[21px] left-[16px] h-[2px] bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `calc(${progressWidth} - 32px)` }}
                        />
                        <div className="flex justify-between relative z-10">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white dark:ring-slate-950 shadow-sm" />
                            <span className="text-[9px] font-semibold text-slate-900 dark:text-white">Raised</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-950 ${
                              req.status !== 'Open' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
                            }`} />
                            <span className={`text-[9px] font-semibold ${
                              req.status !== 'Open' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                            }`}>Assigned</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-950" />
                            <span className="text-[9px] font-semibold text-slate-400">Resolved</span>
                          </div>
                        </div>
                      </div>

                      {/* Info context message */}
                      <div className="mt-auto bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex gap-2.5 items-start">
                        <Info className="size-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Latest Update:</span>{' '}
                          {isPlumbing 
                            ? "Technician Mario is scheduled to arrive tomorrow between 10:00 AM - 12:00 PM."
                            : "Awaiting IT vendor assignment. We expect connection restoration within 24 hours."
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
        <TabsContent value="past" className="outline-none flex flex-col gap-4">
          {pastRequests.length === 0 ? (
            <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-12">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">No Past Requests</h3>
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
                    className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between"
                  >
                    <CardContent className="p-5 flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${getCategoryColor(req.category)}`}>
                            {getCategoryIcon(req.category)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{req.title}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Completed • Raised {req.raisedDate}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[10px] font-bold py-0.5 px-2.5 rounded-full">
                          Resolved
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                        {req.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
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
                            <span className="text-[10px] text-slate-400 ml-1 font-semibold">Rated</span>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary hover:text-primary/95 text-[11px] h-8 font-semibold p-0 flex items-center gap-1.5"
                            onClick={() => {
                              setRatingTarget(req.id);
                              setTempRating(0);
                            }}
                          >
                            <Star className="size-3.5" />
                            Rate Service
                          </Button>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Technician Sarah
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
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-[0_8px_16px_rgba(0,61,155,0.3)] flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all z-40 group"
      >
        <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Dialog for Raising Request */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Raise Service Request</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                className="w-full text-xs"
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
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      priority === level 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Photo upload block */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Attachment (Optional)</Label>
              <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex flex-col items-center justify-center gap-2 relative min-h-[100px]">
                {attachedImage ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-black/70 font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="size-6 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">Upload issue image (Max 5MB)</span>
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
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary text-xs font-bold">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingTarget !== null} onOpenChange={(open) => !open && setRatingTarget(null)}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4">
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
                className="hover:scale-110 active:scale-95 transition-transform"
                onClick={() => setTempRating(star)}
              >
                <Star 
                  className={`size-7 ${
                    star <= tempRating 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-slate-200 dark:text-slate-800'
                  }`} 
                />
              </button>
            ))}
          </div>

          <DialogFooter className="w-full flex gap-2 sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 text-xs"
              onClick={() => setRatingTarget(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="flex-1 bg-primary text-xs font-bold"
              onClick={handleRateSubmit}
              disabled={tempRating === 0}
            >
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
