"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PlusCircle, Megaphone, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const OwnerNotices: React.FC = () => {
  const { notices, addNotice } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsPosting(true);
    setSuccess(false);

    // Simulate lag for tactile feedback
    setTimeout(async () => {
      await addNotice(title, message);
      setIsPosting(false);
      setSuccess(true);
      setTitle('');
      setMessage('');
      
      // Clear success indicator after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Notices Board
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Post notices and events visible to all residents.
        </p>
      </header>

      {/* Broadcast Form */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            Broadcast Announcement
          </h2>

          <form onSubmit={handlePostNotice} className="space-y-4">
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-450 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <Check className="size-4" />
                Notice posted successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block" htmlFor="notice-title">Title</label>
              <input 
                id="notice-title"
                type="text"
                placeholder="e.g. Wi-Fi Maintenance Session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isPosting}
                className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block" htmlFor="notice-msg">Message</label>
              <textarea 
                id="notice-msg"
                placeholder="e.g. Detailed description of the event or maintenance schedule..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isPosting}
                rows={4}
                className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isPosting}
              className="w-full h-11 bg-primary font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-transform cursor-pointer"
            >
              {isPosting ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="size-4.5" />
                  Post Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Notices</h2>
        <div className="flex flex-col gap-2">
          {notices.map((notice) => (
            <div 
              key={notice.id} 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {notice.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">{notice.date}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
