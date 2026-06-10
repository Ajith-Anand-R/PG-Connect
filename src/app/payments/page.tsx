"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CreditCard, 
  Download, 
  Home,
  CheckCircle2,
  Wrench,
  AlertCircle,
  QrCode,
  Smartphone,
  Check,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentsPage() {
  const { bills, payBill, tenant } = useApp();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UPI payment steps state
  const [paymentStep, setPaymentStep] = useState<'choose_method' | 'card_confirm' | 'upi_apps' | 'upi_qr' | 'confirm_status'>('choose_method');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Calculate unpaid balance dynamically
  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  const totalBalance = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);

  // Get active pay now item
  const activePayBill = unpaidBills[0];

  const handleOpenPay = (id: string) => {
    setSelectedBill(id);
    setPaymentStep('choose_method');
    setPayModalOpen(true);
  };

  const handleProcessPayment = () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    setTimeout(() => {
      payBill(selectedBill, 'Card');
      setIsProcessing(false);
      setPayModalOpen(false);
      setSelectedBill(null);
    }, 1550);
  };

  const handleConfirmUpiPaid = () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    setTimeout(() => {
      payBill(selectedBill, 'UPI');
      setIsProcessing(false);
      setPayModalOpen(false);
      setSelectedBill(null);
    }, 1000);
  };

  const getUpiUrl = (app: string, bill: any) => {
    const ownerVpa = tenant.pgUpiId || "pgowner@upi";
    const ownerName = tenant.pgUpiName || tenant.pgUpiRegisteredName || tenant.pgName || "PG Owner";
    const amount = bill?.amount || 0;
    const note = `Rent Payment for ${bill?.title || 'Bill'}`;
    const params = `pa=${ownerVpa}&pn=${encodeURIComponent(ownerName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

    if (isMobile) {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isAndroid) {
        switch(app) {
          case 'gpay':
            return `intent://pay?${params}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
          case 'phonepe':
            return `intent://pay?${params}#Intent;scheme=upi;package=com.phonepe.app;end`;
          case 'paytm':
            return `intent://pay?${params}#Intent;scheme=upi;package=net.one97.paytm;end`;
          case 'bhim':
            return `intent://pay?${params}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
          default:
            return `upi://pay?${params}`;
        }
      } else if (isIOS) {
        switch(app) {
          case 'gpay':
            return `gpay://upi/pay?${params}`;
          case 'phonepe':
            return `phonepe://upi/pay?${params}`;
          case 'paytm':
            return `paytmmp://upi/pay?${params}`;
          case 'bhim':
            return `bhim://upi/pay?${params}`;
          default:
            return `upi://pay?${params}`;
        }
      }
    }
    return `upi://pay?${params}`;
  };

  const handleLaunchUpi = (app: string) => {
    const bill = bills.find(b => b.id === selectedBill);
    if (!bill) return;
    const url = getUpiUrl(app, bill);
    window.location.href = url;
    // Delay slightly then move to confirm status screen
    setTimeout(() => {
      setPaymentStep('confirm_status');
    }, 1000);
  };

  const getBillIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'rent': return <Home className="size-5" />;
      case 'utility': return <CreditCard className="size-5" />;
      default: return <Wrench className="size-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Title */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payments & Receipts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your rent, utilities, and view invoices.
        </p>
      </header>

      {/* Balance Bento Box */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-5">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Outstanding Dues
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">$</span>
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalBalance.toFixed(2)}
              </span>
            </div>
            
            {totalBalance > 0 && activePayBill ? (
              <p className="text-xs text-destructive font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                Due soon: {activePayBill.title}
              </p>
            ) : (
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                All payments clear!
              </p>
            )}
          </div>

          <div className="z-10 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Auto-Pay Method</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Visa ending in {tenant.cardLastFour || '4242'}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 dark:text-primary">
              Active
            </Badge>
          </div>

          {totalBalance > 0 && activePayBill && (
            <Button 
              className="w-full bg-primary font-bold transition-transform active:scale-[0.98]"
              onClick={() => handleOpenPay(activePayBill.id)}
            >
              Pay Outstanding Dues
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Ledger Summary List */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ledger & Statements</h2>
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <div 
              key={bill.id} 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  bill.status === 'Paid' 
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {getBillIcon(bill.category)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {bill.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {bill.status === 'Paid' ? `Paid via ${bill.dueDate === 'Paid' ? 'Card' : 'UPI'}` : bill.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${bill.amount.toFixed(2)}
                  </span>
                  <Badge 
                    className={`text-[9px] font-bold py-0.5 px-2 mt-1 border-transparent ${
                      bill.status === 'Paid' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' 
                        : 'bg-destructive/10 text-destructive hover:bg-destructive/10'
                    }`}
                  >
                    {bill.status}
                  </Badge>
                </div>

                {bill.status === 'Paid' ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-slate-500 hover:text-primary active:scale-95 transition-transform"
                    title="Download Receipt"
                  >
                    <Download className="size-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold px-3 py-1 border-slate-200 hover:bg-slate-55 dark:border-slate-800 active:scale-[0.98]"
                    onClick={() => handleOpenPay(bill.id)}
                  >
                    Pay
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment confirmation modal */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-[90%] rounded-3xl sm:max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-100 dark:border-slate-900 shadow-2xl p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {paymentStep === 'choose_method' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Select Payment Method</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how you would like to clear your outstanding bill.
                  </DialogDescription>
                </DialogHeader>

                {selectedBill && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex justify-between items-center my-1">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {bills.find(b => b.id === selectedBill)?.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Due date: {bills.find(b => b.id === selectedBill)?.dueDate}</p>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      ${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-2">
                  {/* UPI Option */}
                  <button
                    onClick={() => {
                      if (isMobile) {
                        setPaymentStep('upi_apps');
                      } else {
                        setPaymentStep('upi_qr');
                      }
                    }}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Smartphone className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">UPI Payments (Instant)</span>
                          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[9px] font-bold py-0.5 px-1.5 rounded-full uppercase tracking-wider">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pay via PhonePe, GPay, Paytm, or BHIM</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setPaymentStep('card_confirm')}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Saved Credit Card</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Visa ending in *{tenant.cardLastFour || '4242'}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </button>
                </div>

                <DialogFooter className="mt-4 border-t border-slate-50 dark:border-slate-900 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl"
                    onClick={() => setPayModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {paymentStep === 'card_confirm' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader className="flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 absolute -left-2 top-0"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8">Card Payment</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-505">
                  Process checkout for your pending utility bill using your registered payment card.
                </DialogDescription>

                {selectedBill && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex justify-between items-center my-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {bills.find(b => b.id === selectedBill)?.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Card ending in *{tenant.cardLastFour || '4242'}</p>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      ${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={() => setPaymentStep('choose_method')}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button 
                    className="rounded-xl bg-primary font-bold flex-1"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authorizing...
                      </span>
                    ) : "Confirm & Pay"}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {paymentStep === 'upi_apps' && (
              <motion.div
                key="upi_apps"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader className="flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 absolute -left-2 top-0"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8 font-sans">Select UPI App</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-500">
                  Select an app to pay. It will open and prefill owner details and amount of <span className="font-extrabold text-slate-800 dark:text-slate-100">${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}</span>.
                </DialogDescription>

                {/* Owner info callout */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">To Owner:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{tenant.pgUpiName || tenant.pgUpiRegisteredName || tenant.pgName || "PG Owner"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">UPI ID / Phone:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{tenant.pgUpiId || tenant.pgUpiNumber || "pgowner@upi"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-1">
                  {/* Google Pay */}
                  <button
                    onClick={() => handleLaunchUpi('gpay')}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shadow-xs">
                      {/* Stylized Google Pay SVG */}
                      <svg viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7.5v-6H9v6zm4 0h-1.5v-2.5h-2V13h2v-2H13v6zm4.5-4.5h-2v2h2V16h-2v1H15v-6h3.5v1.5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Google Pay</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => handleLaunchUpi('phonepe')}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 shadow-xs">
                      {/* Stylized PhonePe SVG */}
                      <svg viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 9.9 13 10.5 13 12h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">PhonePe</span>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => handleLaunchUpi('paytm')}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-500 shadow-xs">
                      {/* Stylized Paytm SVG */}
                      <svg viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 16H7v-2h10v2zm-2-4H9v-2h6v2zm2-4H7V8h10v2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Paytm</span>
                  </button>

                  {/* BHIM UPI */}
                  <button
                    onClick={() => handleLaunchUpi('bhim')}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shadow-xs">
                      {/* Stylized BHIM SVG */}
                      <svg viewBox="0 0 24 24" className="size-6 shrink-0 fill-current">
                        <path d="M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">BHIM UPI</span>
                  </button>
                </div>

                {/* Generic OS Chooser Button */}
                <button
                  onClick={() => handleLaunchUpi('generic')}
                  className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <Smartphone className="size-4" />
                  Show All Installed UPI Apps
                </button>
              </motion.div>
            )}

            {paymentStep === 'upi_qr' && (
              <motion.div
                key="upi_qr"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <DialogHeader className="w-full flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 absolute -left-2 top-0"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8 font-sans w-full text-center pr-8">Scan QR Code</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-505 px-2">
                  Open GPay, PhonePe, Paytm, or BHIM on your mobile phone and scan this QR code to pay.
                </DialogDescription>

                {selectedBill && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* QR Code Container */}
                    <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                      {/* Public QR Code API */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(getUpiUrl('generic', bills.find(b => b.id === selectedBill)))}`} 
                        alt="UPI Payment QR Code"
                        className="size-[200px] select-none"
                      />
                      <div className="absolute inset-0 border border-primary/20 rounded-3xl pointer-events-none" />
                    </div>

                    {/* Payee Info */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 w-full text-left flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">Payee (Owner):</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{tenant.pgUpiName || tenant.pgUpiRegisteredName || tenant.pgName || "PG Owner"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">UPI ID:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{tenant.pgUpiId || tenant.pgUpiNumber || "pgowner@upi"}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800 pt-1.5 mt-1">
                        <span className="font-bold text-slate-500">Amount Due:</span>
                        <span className="font-extrabold text-lg text-primary">
                          ${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="w-full flex flex-col sm:flex-row gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1"
                    onClick={() => setPaymentStep('choose_method')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-xl bg-primary font-bold flex-1"
                    onClick={() => setPaymentStep('confirm_status')}
                  >
                    I Have Paid
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {paymentStep === 'confirm_status' && (
              <motion.div
                key="confirm_status"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4 text-center py-4"
              >
                <div className="size-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center animate-bounce mb-2">
                  <AlertCircle className="size-8" />
                </div>

                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Verify Payment</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-1.5">
                    Did you complete the payment of <span className="font-extrabold text-slate-800 dark:text-slate-100">${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}</span> in your UPI App?
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 w-full mt-4">
                  <Button 
                    className="rounded-xl bg-primary font-bold w-full h-12"
                    onClick={handleConfirmUpiPaid}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="size-4 stroke-[3px]" />
                        Yes, I Have Paid
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="rounded-xl w-full h-12"
                    onClick={() => {
                      if (isMobile) {
                        setPaymentStep('upi_apps');
                      } else {
                        setPaymentStep('upi_qr');
                      }
                    }}
                    disabled={isProcessing}
                  >
                    No, Cancel & Retry
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
