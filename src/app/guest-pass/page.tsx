"use client";

import React, { useState } from 'react';
import { useApp, GuestPass } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Plus, 
  QrCode, 
  Clock, 
  User, 
  ExternalLink,
  History,
  Check,
  Share2,
  Sparkles,
  Package,
  ClipboardList
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

export default function GuestPassPage() {
  const { guestPasses, addGuestPass, tenant, parcels, staffLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'passes' | 'parcels' | 'help'>('passes');
  
  const activePasses = guestPasses.filter(pass => 
    pass.visitorType === 'guest' && 
    !pass.checkInTime && 
    pass.approvalStatus === 'approved'
  );

  const historyLogs = guestPasses.filter(pass => 
    pass.checkInTime || 
    pass.approvalStatus === 'rejected' || 
    pass.approvalStatus === 'leave_at_gate'
  );
  const [isNewPassOpen, setIsNewPassOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState('14:00');
  const [exitTime, setExitTime] = useState('22:00');

  // Hardcoded historical passes to match the design logs
  const historyPasses = [
    { id: 'h1', visitorName: 'Rohan Sharma', relationship: 'Friend', phone: '+91 9988776655', date: 'Yesterday', status: 'Expired', type: 'Day Pass' },
    { id: 'h2', visitorName: 'Mahesh Kumar', relationship: 'Delivery', phone: '+91 9876543210', date: '2 days ago', status: 'Used', type: 'Delivery clearance' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim()) return;

    addGuestPass(guestName, relationship, phone, date, entryTime, exitTime);
    
    // Reset Form
    setGuestName('');
    setRelationship('Friend');
    setPhone('');
    setDate(new Date().toISOString().split('T')[0]);
    setEntryTime('14:00');
    setExitTime('22:00');
    setIsNewPassOpen(false);
  };

  const handleShare = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visitor & Security Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pre-approve guests, check daily helpers, and view packages at the gate.
          </p>
        </div>
      </motion.div>

      {/* Tab Selector */}
      <motion.div variants={itemVariants} className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 my-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('passes')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'passes'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Guest Passes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('parcels')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'parcels'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Parcels ({parcels.filter(p => p.status === 'at_gate').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('help')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'help'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Daily Help
        </button>
      </motion.div>

      {/* RENDER PASSES TAB */}
      {activeTab === 'passes' && (
        <>
          {/* Hero Invitation Banner */}
          <motion.div 
            variants={itemVariants} 
            className="bg-gradient-to-br from-indigo-600 via-primary to-accent text-white rounded-[24px] p-6 shadow-[0_20px_45px_rgba(88,67,233,0.18)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 border border-white/10 glow-primary"
          >
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #ffffff 0%, transparent 60%)' }} />
            <div className="z-10 text-center md:text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2 border border-white/10">
                <Sparkles className="size-2.5 animate-pulse" /> Clearances
              </span>
              <h2 className="text-lg font-bold">Need to register a guest?</h2>
              <p className="text-xs text-white/80 dark:text-slate-200 mt-1 max-w-sm leading-relaxed font-semibold">
                Generate a secure QR access pass for parking slots or building security gates instantly.
              </p>
            </div>
            <Button 
              onClick={() => setIsNewPassOpen(true)}
              className="z-10 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-700 font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md w-full md:w-auto cursor-pointer border-0"
            >
              <Plus className="size-4 shrink-0 mr-1" />
              Create New Pass
            </Button>
          </motion.div>

          {/* Active Passes Section */}
          <section className="flex flex-col gap-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-slate-100/40 dark:border-slate-800/40 pb-2">
              <UserCheck className="size-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Active Passes</h2>
            </motion.div>

            {activePasses.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="glass-card border-dashed border-slate-205 dark:border-slate-800 bg-transparent py-10 rounded-3xl">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <QrCode className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Active Passes</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                        You don&apos;t have any pre-approved guests registered for today.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {activePasses.map((pass) => (
                    <motion.div
                      key={pass.id}
                      variants={itemVariants}
                      layout
                      className="flex flex-col"
                    >
                      <Card className="glass-card border-transparent shadow-none rounded-3xl flex flex-col justify-between hover:shadow-sm">
                        <CardContent className="p-5 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200/50 dark:border-slate-800/50">
                                <User className="size-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pass.visitorName}</h4>
                                <Badge className="bg-slate-100/80 text-slate-600 dark:bg-slate-900 dark:text-slate-350 border-transparent text-[9px] font-bold py-0.5 px-2 mt-1 rounded-full w-max">
                                  {pass.relationship}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{pass.date}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100/50 dark:border-slate-900/50 pt-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 font-semibold">
                              <Clock className="size-3.5" />
                              <span>{pass.entryTime} - {pass.exitTime}</span>
                            </div>
                            
                            <Button 
                              variant="link" 
                              onClick={() => setSelectedPass(pass)}
                              className="text-indigo-600 font-bold text-xs p-0 h-auto flex items-center gap-0.5 cursor-pointer hover:underline border-0"
                            >
                              View QR Pass <ExternalLink className="size-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* History Section */}
          <section className="flex flex-col gap-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-slate-100/40 dark:border-slate-800/40 pb-2">
              <History className="size-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">History Logs</h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-transparent shadow-none rounded-3xl overflow-hidden">
                <div className="divide-y divide-slate-100/30 dark:divide-slate-900/30">
                  {historyLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                      No past visitor activity recorded.
                    </div>
                  ) : (
                    historyLogs.map((log) => {
                      const isDelivery = log.visitorType === 'delivery';
                      
                      const getStatusBadge = () => {
                        if (log.approvalStatus === 'rejected') {
                          return { label: "Denied", style: "bg-rose-500/10 text-rose-600 border-rose-500/10" };
                        }
                        if (log.approvalStatus === 'leave_at_gate') {
                          return { label: "Left at Gate", style: "bg-blue-500/10 text-blue-600 border-blue-500/10" };
                        }
                        if (log.checkOutTime) {
                          return { label: "Checked Out", style: "bg-slate-100 text-slate-500 border-slate-200" };
                        }
                        if (log.checkInTime) {
                          return { label: "Checked In", style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" };
                        }
                        return { label: "Approved", style: "bg-indigo-500/10 text-indigo-650 border-indigo-500/10" };
                      };
                      
                      const badge = getStatusBadge();

                      return (
                        <div 
                          key={log.id} 
                          className="p-4.5 hover:bg-white/20 dark:hover:bg-slate-900/20 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100/50 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                              {isDelivery ? <Package className="size-4.5" /> : <User className="size-4.5" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{log.visitorName}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                                {isDelivery ? `${log.deliveryCompany || 'Courier'} Delivery` : log.relationship} • {log.date}
                              </p>
                            </div>
                          </div>

                          <Badge className={`${badge.style} border text-[9px] font-bold py-0.5 px-2 rounded-full`}>
                            {badge.label}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </motion.div>
          </section>
        </>
      )}

      {/* RENDER PARCELS TAB */}
      {activeTab === 'parcels' && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-slate-100/40 dark:border-slate-800/40 pb-2">
            <Package className="size-5 text-indigo-600" />
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Gate Parcel Inventory</h2>
          </div>

          {parcels.length === 0 ? (
            <Card className="glass-card border-dashed border-slate-205 dark:border-slate-800 bg-transparent py-10 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <Package className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Parcels at Gate</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    Any packages left with the security gate will show up here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcels.map((parcel) => (
                <Card key={parcel.id} className="glass-card border-transparent shadow-none rounded-3xl flex flex-col justify-between hover:shadow-sm">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 shrink-0">
                          <Package className="size-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{parcel.deliveryCompany}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Received: {new Date(parcel.receivedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <Badge className={`${
                        parcel.status === 'at_gate'
                          ? 'bg-amber-500/10 text-amber-600'
                          : parcel.status === 'collected'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      } border-transparent text-[9px] font-bold py-0.5 px-2 rounded-full`}>
                        {parcel.status === 'at_gate' ? 'At Gate' : parcel.status === 'collected' ? 'Collected' : 'Returned'}
                      </Badge>
                    </div>

                    {parcel.parcelPhotoUrl && (
                      <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img
                          src={parcel.parcelPhotoUrl}
                          alt="Parcel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {parcel.status === 'at_gate' && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100/60 dark:border-slate-800/60 text-center flex flex-col gap-1 items-center justify-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification OTP</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white tracking-widest leading-none mt-1">{parcel.verificationOtp}</span>
                        <Button
                          variant="link"
                          onClick={() => handleCopyOtp(parcel.verificationOtp)}
                          className="text-indigo-600 font-bold text-[10px] p-0 h-auto cursor-pointer border-0 mt-1"
                        >
                          {copiedOtp === parcel.verificationOtp ? 'Copied!' : 'Copy OTP'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* RENDER DAILY HELP TAB */}
      {activeTab === 'help' && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-slate-100/40 dark:border-slate-800/40 pb-2">
            <ClipboardList className="size-5 text-indigo-600" />
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Property Staff Logs</h2>
          </div>

          {staffLogs.length === 0 ? (
            <Card className="glass-card border-dashed border-slate-205 dark:border-slate-800 bg-transparent py-10 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <User className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Daily Help Logged</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    House staff or service providers currently active in the building will show here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffLogs.map((log) => {
                const isActive = !log.exit_time || log.exit_time === 'Pending';
                return (
                  <Card key={log.id} className="glass-card border-transparent shadow-none rounded-3xl flex flex-col justify-between hover:shadow-sm">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-105 dark:bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                            <User className="size-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{log.visitor_name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">
                              Role: {log.relationship}
                            </p>
                          </div>
                        </div>

                        <Badge className={`${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400'
                        } border-transparent text-[9px] font-bold py-0.5 px-2 rounded-full`}>
                          {isActive ? 'In Building' : 'Left'}
                        </Badge>
                      </div>

                      <div className="border-t border-slate-100/50 dark:border-slate-800/50 pt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>In: <strong className="text-slate-800 dark:text-slate-200">{log.entry_time}</strong></span>
                        <span>Out: <strong className="text-slate-800 dark:text-slate-200">{log.exit_time || 'Pending'}</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Dialog for Creating Guest Pass */}
      <Dialog open={isNewPassOpen} onOpenChange={setIsNewPassOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register New Guest</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Pre-approve visitors or deliveries for building security clearance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Guest Full Name</Label>
              <Input 
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Kabir Dev"
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="relationship" className="text-xs font-bold text-slate-700 dark:text-slate-300">Relationship</Label>
                <select 
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="Friend">Friend</option>
                  <option value="Family">Family Member</option>
                  <option value="Delivery">Delivery / Courier</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</Label>
                <Input 
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99887 76655"
                  required
                  className="w-full text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pass-date" className="text-xs font-bold text-slate-700 dark:text-slate-300">Pass Date</Label>
              <Input 
                id="pass-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="entry-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">Entry Window Start</Label>
                <Input 
                  id="entry-time"
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exit-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">Entry Window End</Label>
                <Input 
                  id="exit-time"
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs rounded-xl cursor-pointer">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0">
                Generate Pass
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Pass Detail Dialog styled as a Ticket */}
      <Dialog open={selectedPass !== null} onOpenChange={(open) => !open && setSelectedPass(null)}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl overflow-visible">
          {selectedPass && (
            <>
              <DialogHeader className="text-center items-center">
                <DialogTitle className="text-base font-bold">Visitor Access QR</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Pre-Approved Gate Entry Pass
                </DialogDescription>
              </DialogHeader>

              {/* Digital Pass Ticket Frame */}
              <div className="bg-gradient-to-br from-indigo-600 via-primary to-accent w-full text-white p-5.5 rounded-[22px] flex flex-col items-center gap-4.5 shadow-lg relative overflow-visible">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #ffffff 0%, transparent 60%)' }} />
                
                {/* QR Display */}
                <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner relative z-10">
                  <div className="w-full h-full rounded flex items-center justify-center bg-slate-100 text-slate-805">
                    <QrCode className="size-24 text-slate-800" />
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <h3 className="font-bold text-base leading-tight">{selectedPass.visitorName}</h3>
                  <span className="text-[10px] bg-white/20 text-white font-bold py-0.5 px-3 rounded-full inline-block mt-1.5">
                    {selectedPass.relationship}
                  </span>
                </div>

                {/* Ticket notch cutouts */}
                <div className="absolute top-[68%] -left-3.5 w-7 h-7 rounded-full bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 z-20 pointer-events-none" />
                <div className="absolute top-[68%] -right-3.5 w-7 h-7 rounded-full bg-white dark:bg-slate-950 border-l border-slate-100 dark:border-slate-900 z-20 pointer-events-none" />
                
                {/* Perforated stub line */}
                <div className="w-full border-t border-dashed border-white/20 my-1 relative z-10" />

                <div className="w-full grid grid-cols-2 gap-3 bg-white/10 p-3 rounded-2xl text-center text-[9px] border border-white/10 relative z-10 font-bold">
                  <div>
                    <span className="opacity-70 block uppercase text-[7px] tracking-wider mb-0.5">Pass Date</span>
                    <span className="text-white block">{selectedPass.date}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block uppercase text-[7px] tracking-wider mb-0.5">Duration</span>
                    <span className="text-white block">{selectedPass.entryTime} - {selectedPass.exitTime}</span>
                  </div>
                </div>

                <div className="text-[8.5px] opacity-75 uppercase tracking-widest font-black text-center relative z-10">
                  Invited By: {tenant.name}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <Button 
                  onClick={() => handleShare(selectedPass.qrCodeToken)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl cursor-pointer py-5 shadow-sm border-0"
                >
                  {copiedToken === selectedPass.qrCodeToken ? (
                    <>
                      <Check className="size-3.5" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5" />
                      Share Pass Code
                    </>
                  )}
                </Button>
                <DialogClose render={<Button variant="ghost" className="w-full text-xs text-slate-500 font-bold h-9 rounded-xl cursor-pointer border-0 bg-transparent">Close</Button>} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
