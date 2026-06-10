"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Plus, 
  Users, 
  ChevronRight,
  Phone,
  Video,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ChatsPage() {
  const { chats, sendChatMessage } = useApp();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  
  // New Chat Form State
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatType, setNewChatType] = useState<'Group' | 'DM'>('DM');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeThread = chats.find(c => c.id === activeThreadId);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeThreadId) return;
    sendChatMessage(activeThreadId, inputText.trim());
    setInputText('');
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    alert(`Starting new chat: ${newChatTitle}`);
    setIsNewChatOpen(false);
    setNewChatTitle('');
  };

  return (
    <div className="h-[calc(100vh-135px)] md:h-[calc(100vh-105px)] flex flex-col overflow-hidden -mx-6 -my-6 glass-card rounded-none md:rounded-3xl border-none">
      <div className="flex-1 flex overflow-hidden">
        {/* Thread List Column */}
        <div className={`w-full md:w-80 border-r border-slate-100/50 dark:border-slate-900/60 bg-white/70 dark:bg-slate-950/45 backdrop-blur-md flex flex-col shrink-0 transition-all ${
          activeThreadId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4.5 border-b border-slate-100/40 dark:border-slate-900/40 flex justify-between items-center bg-white/40 dark:bg-slate-950/20">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="size-4.5 text-primary" />
              Roommate Chats
            </h1>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full size-8 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              onClick={() => setIsNewChatOpen(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* List of Threads */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/20 dark:divide-slate-900/20">
            {chats.map((thread, idx) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              const isActive = thread.id === activeThreadId;
              
              return (
                <motion.button
                  key={thread.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04, ease: "easeOut" }}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left p-4.5 flex gap-3.5 items-center hover:bg-white/40 dark:hover:bg-slate-950/20 transition-all cursor-pointer relative ${
                    isActive ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                  )}
                  
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center font-bold text-primary shrink-0 relative">
                    {thread.avatar ? (
                      <img src={thread.avatar} alt={thread.title} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="size-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h2 className={`text-xs font-bold truncate ${isActive ? 'text-primary dark:text-white' : 'text-slate-900 dark:text-slate-205'}`}>
                        {thread.title}
                      </h2>
                      <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                        {lastMessage?.timestamp || '10:30 AM'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {lastMessage ? (
                        `${lastMessage.isSelf ? 'You: ' : `${lastMessage.senderName}: `}${lastMessage.text}`
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                  </div>
                  
                  <ChevronRight className={`size-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-350 dark:text-slate-700'}`} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat Window Column */}
        <div className={`flex-1 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col overflow-hidden transition-all ${
          activeThreadId ? 'flex' : 'hidden md:flex items-center justify-center'
        }`}>
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/50 dark:bg-slate-950/40 backdrop-blur-md p-4 border-b border-slate-100/40 dark:border-slate-900/40 flex justify-between items-center shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden size-8 -ml-1 cursor-pointer"
                    onClick={() => setActiveThreadId(null)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center font-bold text-primary shrink-0">
                    {activeThread.avatar ? (
                      <img src={activeThread.avatar} alt={activeThread.title} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="size-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {activeThread.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      {activeThread.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" className="rounded-full size-8 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <Phone className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full size-8 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <Video className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 overflow-y-auto p-4.5 flex flex-col gap-4">
                <div className="text-center my-2 shrink-0">
                  <span className="text-[9px] font-bold bg-white/60 dark:bg-slate-900/60 text-slate-500 py-1 px-3 rounded-full border border-slate-100/30 dark:border-slate-800/50">
                    Today
                  </span>
                </div>

                {activeThread.messages.map((msg) => {
                  const isSelf = msg.isSelf;
                  
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring" as const, stiffness: 320, damping: 24 }}
                      className={`flex gap-2.5 max-w-[82%] items-end ${
                        isSelf ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      {!isSelf && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-600 shrink-0 select-none">
                          {msg.senderAvatar ? (
                            <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                          ) : (
                            msg.senderName.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-0.5">
                        {!isSelf && (
                          <span className="text-[9px] font-bold text-slate-450 ml-1.5 select-none mb-0.5">
                            {msg.senderName}
                          </span>
                        )}
                        <div className={`p-3.5 rounded-2xl text-xs leading-normal shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
                          isSelf 
                            ? 'bg-gradient-to-tr from-primary to-indigo-600 text-white rounded-br-none glow-primary' 
                            : 'bg-white/80 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100/60 dark:border-slate-850/60'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-1 select-none ${
                          isSelf ? 'text-right mr-1.5' : 'ml-1.5'
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white/40 dark:bg-slate-950/20 border-t border-slate-100/40 dark:border-slate-900/40 flex gap-2.5 items-center shrink-0">
                <Input 
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 rounded-full text-xs px-4.5 h-11 bg-white/80 dark:bg-slate-900/80 border-slate-200/60 focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="rounded-full size-11 bg-primary hover:bg-primary/95 glow-primary shrink-0 flex items-center justify-center cursor-pointer"
                  size="icon"
                >
                  <Send className="size-4.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(88,67,233,0.06)] animate-pulse">
                <MessageSquare className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                  Choose a roommate, roommate group, or PG announcements discussion to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for starting new chat */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Start Conversation</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select a recipient or create a roommate discussion sub-channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStartChat} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chat-type" className="text-xs font-bold text-slate-700 dark:text-slate-300">Conversation Type</Label>
              <select 
                id="chat-type"
                value={newChatType}
                onChange={(e) => setNewChatType(e.target.value as 'Group' | 'DM')}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="DM">Direct Message (Roommate)</option>
                <option value="Group">Group Chat (Wing/Unit)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chat-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {newChatType === 'DM' ? 'Roommate Name' : 'Group Name'}
              </Label>
              <Input 
                id="chat-title"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder={newChatType === 'DM' ? 'e.g. Kabir Dev' : 'e.g. Unit 3B Cleaning Co-op'}
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs rounded-xl cursor-pointer">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer">
                Start Chat
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
