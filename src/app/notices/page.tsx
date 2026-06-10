"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  AlertTriangle, 
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Notice } from '@/context/AppContext';

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
    transition: { type: "spring" as const, stiffness: 300, damping: 25 } 
  }
};

export default function NoticesPage() {
  const { notices } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Notice' | 'Maintenance' | 'Event'>('All');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Filter notices based on search & category tab
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || notice.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-transparent hover:bg-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="size-3" />
            Live Notice Board
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2">
          <Megaphone className="size-8 text-primary" />
          Announcements & Notices
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Official property broadcasts, events, and maintenance schedules from your PG Management.
        </p>
      </motion.header>

      {/* Filter and Search Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-slate-950/25 p-4 rounded-3xl border border-white/20 dark:border-white/5 shadow-none">
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Search className="size-4 absolute left-3.5 text-slate-450 dark:text-slate-505" />
          <Input 
            placeholder="Search notices..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 text-xs rounded-xl bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/80 focus-visible:ring-primary w-full"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start border border-slate-100/30 dark:border-slate-800/20">
          {(['All', 'Notice', 'Maintenance', 'Event'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cat === 'All' ? 'All Bulletins' : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotices.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full bg-white/40 dark:bg-slate-950/25 border border-white/20 dark:border-white/5 rounded-3xl p-12 text-center shadow-none flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Megaphone className="size-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No announcements found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {searchQuery || activeCategory !== 'All' 
                    ? "Try resetting your search filters or selecting a different bulletin board tab."
                    : "All quiet here! Landlord hasn't posted any notices for your building yet."}
                </p>
              </div>
              {(searchQuery || activeCategory !== 'All') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="mt-2 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            filteredNotices.map((notice) => {
              const isUrgent = notice.category === 'Maintenance';
              return (
                <motion.div
                  key={notice.id}
                  variants={itemVariants}
                  layout
                  className="flex flex-col h-full"
                >
                  <Card 
                    className={`glass-card glass-card-hover border-transparent shadow-none relative overflow-hidden flex flex-col justify-between rounded-3xl group h-full ${
                      isUrgent ? 'border-l-4 border-l-destructive!' : ''
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col gap-4 h-full justify-between">
                      <div>
                        {isUrgent && (
                          <div className="absolute -right-2 -top-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle className="size-20 text-destructive" />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center gap-2 mb-3">
                          <Badge className={`${
                            isUrgent 
                              ? 'bg-destructive/10 text-destructive' 
                              : notice.category === 'Event'
                              ? 'bg-primary/10 text-primary dark:text-primary'
                              : 'bg-secondary/10 text-secondary'
                          } border-transparent text-[10px] font-black py-0.5 px-2.5 rounded-full`}>
                            {notice.category}
                          </Badge>
                          <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="size-3" />
                            {notice.date}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors line-clamp-1">{notice.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {notice.content}
                        </p>
                      </div>

                      <button 
                        onClick={() => setSelectedNotice(notice)}
                        className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-0.5 w-max group/btn cursor-pointer"
                      >
                        Read full notice 
                        <ChevronRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
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
                  } border-transparent text-[10px] font-bold py-0.5 px-2.5 rounded-full`}>
                    {selectedNotice.category}
                  </Badge>
                  <span className="text-xs text-slate-450 font-bold flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {selectedNotice.date}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedNotice.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/50 dark:border-slate-850/50 pt-4 max-h-[200px] overflow-y-auto pr-1 font-medium">
                {selectedNotice.content}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex gap-3 mt-4 items-start">
                <Info className="size-4.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                  This notice applies to all active residents of your building location. For any queries, please feel free to reach out via support ticket or contact the front-desk reception office directly.
                </p>
              </div>

              <DialogFooter className="mt-5">
                <DialogClose render={
                  <Button className="w-full bg-primary hover:bg-primary/95 font-bold text-xs rounded-xl shadow-xs py-5 cursor-pointer glow-primary">
                    Acknowledge Notice
                  </Button>
                } />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
