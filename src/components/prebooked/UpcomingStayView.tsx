"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  LogOut, 
  QrCode, 
  Building,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from '@/components/ui/dialog';

export function UpcomingStayView() {
  const { tenant, bills, payBill, activateStay, logout } = useApp();
  
  // Find unpaid Security Deposit
  const depositBill = bills.find(b => b.title === 'Security Deposit' && b.status !== 'Paid');
  const isDepositPaid = !depositBill;

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Parse join date
  const rawJoinDate = tenant.joiningDate ? new Date(tenant.joiningDate) : new Date();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = rawJoinDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCanCheckIn(true);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setCanCheckIn(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tenant.joiningDate]);

  const handleMockPayment = async () => {
    if (!depositBill) return;
    setIsProcessingPayment(true);
    // Simulate API delay
    setTimeout(async () => {
      await payBill(depositBill.id, paymentMethod === 'upi' ? 'UPI' : 'Card');
      setIsProcessingPayment(false);
      setIsPayModalOpen(false);
    }, 1500);
  };

  const handleCheckInSubmit = async () => {
    setIsActivating(true);
    const { error } = await activateStay();
    setIsActivating(false);
    if (error) {
      alert("Activation failed: " + error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90dvh] w-full px-4 py-8 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col gap-6"
      >
        {/* Header Title */}
        <div className="text-center flex flex-col gap-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Building className="size-6" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
            <Sparkles className="size-3 text-amber-500 animate-spin" />
            Upcoming Stay Reservation
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {tenant.pgName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
            Welcome, {tenant.name}! Your room allocation is ready. Complete steps below to confirm check-in.
          </p>
        </div>

        {/* Room details info block */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-850 rounded-2xl shadow-none">
          <CardContent className="p-4 flex flex-col gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-350">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">Allocated Space</span>
              <span className="text-slate-850 dark:text-white font-extrabold">{tenant.room} • Bed {tenant.bed}</span>
            </div>
            <div className="h-px bg-slate-200/40 dark:bg-slate-800/40 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">Expected Check-in</span>
              <span className="text-slate-850 dark:text-white font-extrabold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" />
                {tenant.joiningDate}
              </span>
            </div>
            <div className="h-px bg-slate-200/40 dark:bg-slate-800/40 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">Security Deposit</span>
              <span className="text-slate-850 dark:text-white font-extrabold">{tenant.deposit || '₹5,000.00'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Panel - Deposit Required or Countdown */}
        {!isDepositPaid ? (
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-3xl flex flex-col gap-4 text-center items-center"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Deposit Payment Required</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                Please complete the ₹{depositBill.amount.toLocaleString()} security deposit payment to secure your bed allocation.
              </p>
            </div>
            <Button 
              onClick={() => setIsPayModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4.5 rounded-2xl shadow-md shadow-amber-500/10 text-xs tracking-wider uppercase cursor-pointer"
            >
              <CreditCard className="size-4 mr-2" />
              Pay Security Deposit
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col gap-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 p-5 rounded-3xl"
          >
            {/* Payment success flag */}
            <div className="flex items-center gap-2.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl w-full justify-center">
              <CheckCircle className="size-4" />
              Security Deposit Paid
            </div>

            {/* Countdown layout */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Clock className="size-3.5 text-primary" />
                Time Remaining to Move-In
              </span>

              {/* Timer Grid */}
              <div className="flex gap-2 text-center select-none mt-1">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hrs' },
                  { value: timeLeft.minutes, label: 'Mins' },
                  { value: timeLeft.seconds, label: 'Secs' }
                ].map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl px-2.5 py-1.5 w-14 shrink-0 shadow-3xs">
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-none">
                      {String(t.value).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-extrabold text-slate-400 mt-1 uppercase tracking-wider leading-none">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Check In Trigger */}
            <Button 
              onClick={handleCheckInSubmit}
              disabled={!canCheckIn || isActivating}
              className={`w-full font-black py-4.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer transition-all ${
                canCheckIn 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/15'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/40 cursor-not-allowed'
              }`}
            >
              {isActivating ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              {canCheckIn ? 'Confirm Physical Check-In' : 'Check-In Locks Until Start Date'}
            </Button>
          </motion.div>
        )}

        {/* Footer Log Out options */}
        <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400 px-2 select-none border-t border-slate-100/40 dark:border-slate-800/40 pt-4 mt-1">
          <span>Wrong account?</span>
          <button 
            onClick={logout}
            className="text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-black"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Pay Modal Dialog */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-[2rem] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Pay Security Deposit
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select your payment method. Dues will clear instantly in PG system.
            </DialogDescription>
          </DialogHeader>

          {/* Dues Details */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 mt-4 text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
            <span>Amount Due</span>
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">
              ₹{depositBill?.amount?.toLocaleString() || '5,000'}
            </span>
          </div>

          {/* Payment Method selector */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                paymentMethod === 'upi'
                  ? 'border-primary bg-primary/5 text-primary font-black'
                  : 'border-slate-200/50 hover:bg-slate-50 text-slate-500 font-bold'
              }`}
            >
              <QrCode className="size-6" />
              <span className="text-xs">UPI Payment</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/5 text-primary font-black'
                  : 'border-slate-200/50 hover:bg-slate-50 text-slate-500 font-bold'
              }`}
            >
              <Smartphone className="size-6" />
              <span className="text-xs">Debit/Credit Card</span>
            </button>
          </div>

          {/* UPI QR Mock */}
          {paymentMethod === 'upi' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-col items-center bg-slate-50 dark:bg-slate-900 border border-slate-200/40 p-4 rounded-2xl gap-3 text-center"
            >
              <div className="bg-white p-2.5 rounded-xl border flex items-center justify-center">
                <QrCode className="size-24 text-slate-800" />
              </div>
              <div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase">BHIM UPI QR</span>
                <p className="text-[10px] text-slate-400 mt-1.5 font-semibold leading-relaxed">
                  Scan QR code with GPay, PhonePe, or Paytm to complete mockup payment.
                </p>
              </div>
            </motion.div>
          )}

          <DialogFooter className="mt-6 flex gap-2.5">
            <DialogClose render={
              <Button 
                variant="outline" 
                className="flex-1 text-xs rounded-xl cursor-pointer" 
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
            } />
            <Button
              onClick={handleMockPayment}
              disabled={isProcessingPayment}
              className="flex-1 bg-primary hover:bg-primary/95 text-white font-black text-xs rounded-xl cursor-pointer"
            >
              {isProcessingPayment ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="size-4 mr-2" />
              )}
              {isProcessingPayment ? 'Processing...' : 'Confirm Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
