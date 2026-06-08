"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <header className="flex flex-col gap-1.5">
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
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Search className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
          <Input 
            placeholder="Search notices..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary w-full"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
          {(['All', 'Notice', 'Maintenance', 'Event'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {cat === 'All' ? 'All Bulletins' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Megaphone className="size-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No announcements found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
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
                className="mt-2 text-xs font-semibold rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isUrgent = notice.category === 'Maintenance';
            return (
              <Card 
                key={notice.id} 
                className={`border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 rounded-2xl group ${
                  isUrgent ? 'border-l-4 border-l-destructive' : ''
                }`}
              >
                <CardContent className="p-5 flex flex-col gap-4 h-full justify-between">
                  <div>
                    {isUrgent && (
                      <div className="absolute -right-2 -top-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
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
                      } border-transparent text-[10px] font-bold py-0.5 px-2 rounded-full`}>
                        {notice.category}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="size-3" />
                        {notice.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors line-clamp-1">{notice.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-355 mt-2 line-clamp-3 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedNotice(notice)}
                    className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-0.5 w-max group/btn cursor-pointer"
                  >
                    Read full notice 
                    <ChevronRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={selectedNotice !== null} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="max-w-md w-full p-6 rounded-2xl">
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
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {selectedNotice.date}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedNotice.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 max-h-[200px] overflow-y-auto pr-1">
                {selectedNotice.content}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex gap-3 mt-4 items-start">
                <Info className="size-4.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  This notice applies to all active residents of your building location. For any queries, please feel free to reach out via support ticket or contact the front-desk reception office directly.
                </p>
              </div>

              <DialogFooter className="mt-5">
                <DialogClose render={
                  <Button className="w-full bg-primary font-bold text-xs rounded-xl shadow-xs py-5">
                    Acknowledge Notice
                  </Button>
                } />
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
