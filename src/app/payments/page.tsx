"use client";

import React, { useState, useEffect } from 'react';
import { useApp, Bill } from '@/context/AppContext';
import { 
  CreditCard, 
  Download, 
  Home,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Smartphone,
  Check,
  ChevronRight,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function PaymentsPage() {
  const { bills, payBill, tenant } = useApp();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UPI payment steps state
  const [paymentStep, setPaymentStep] = useState<'choose_method' | 'card_confirm' | 'upi_apps' | 'upi_details' | 'confirm_status'>('choose_method');
  const [isMobile, setIsMobile] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleDownloadReceipt = (bill: Bill) => {
    try {
      const { jsPDF } = require("jspdf");
      const doc = new jsPDF();

      // Brand color scheme: Slate & Teal
      const primaryTeal = [13, 148, 136];
      const textSlate = [15, 23, 42];
      const textMuted = [100, 116, 139];

      // Draw header band
      doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.rect(0, 0, 210, 40, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("PG CONNECT", 20, 25);

      // Receipt Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("OFFICIAL PAYMENT RECEIPT", 140, 25);

      // Receipt info block
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Receipt Details", 20, 55);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Receipt ID: TXN-${bill.id.substring(0, 8).toUpperCase()}`, 20, 65);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 72);
      doc.text(`Payment Status: PAID`, 20, 79);

      // Property info block
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.text("Property", 120, 55);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${tenant.pgName || 'PG Connect Residency'}`, 120, 65);
      doc.text(`UPI ID: ${tenant.pgUpiId || 'payments@pgconnect'}`, 120, 72);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 87, 190, 87);

      // Tenant details block
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.text("Tenant Information", 20, 100);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Name: ${tenant.name}`, 20, 110);
      doc.text(`Room: ${tenant.room} (Bed: ${tenant.bed})`, 20, 117);
      doc.text(`Email: ${tenant.email || 'N/A'}`, 20, 124);
      doc.text(`Phone: ${tenant.phone || 'N/A'}`, 20, 131);

      // Bill details table header
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 140, 170, 10, "F");
      
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 25, 146.5);
      doc.text("Amount (INR)", 150, 146.5);

      // Bill details row
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.text(`${bill.title}`, 25, 160);
      doc.text(`Rs. ${bill.amount.toFixed(2)}`, 150, 160);

      // Table line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 166, 190, 166);

      // Total Amount
      doc.setFont("helvetica", "bold");
      doc.text("Total Paid:", 120, 176);
      doc.text(`Rs. ${bill.amount.toFixed(2)}`, 150, 176);

      // Footer
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("This is an electronically generated receipt and requires no physical signature.", 20, 260);
      doc.text("Thank you for choosing PG Connect!", 20, 265);

      // Save PDF
      doc.save(`Receipt-${bill.title.replace(/\s+/g, "_")}-${bill.id.substring(0, 6)}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const getUpiUrl = (app: string, bill: Bill | null | undefined) => {
    let phoneVpa = "";
    if (tenant.pgUpiNumber) {
      const cleanPhone = tenant.pgUpiNumber.replace(/\D/g, ''); 
      const last10Digits = cleanPhone.slice(-10); 
      if (last10Digits.length === 10) {
        phoneVpa = `${last10Digits}@upi`;
      }
    }

    const ownerVpa = tenant.pgUpiId || phoneVpa || "pgowner@upi";
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payments & Receipts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your rent, utilities, and view invoices.
        </p>
      </motion.header>

      {/* Balance Bento Box styled as a Premium Debit Card */}
      <motion.div variants={itemVariants}>
        <div className="relative w-full aspect-[1.75/1] rounded-[28px] bg-gradient-to-br from-indigo-600 via-primary to-accent text-white p-6 overflow-hidden shadow-[0_20px_50px_rgba(88,67,233,0.25)] glow-primary flex flex-col justify-between">
          {/* Card glow overlays */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-44 h-44 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="h-full flex flex-col justify-between relative z-10">
            {/* Top Card Info */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Outstanding Dues</span>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-xl font-black">₹</span>
                  <span className="text-4xl font-black tracking-tight">{totalBalance.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Gold Chip Mockup */}
              <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-200/50 shadow-inner flex items-center justify-center shrink-0">
                <div className="w-6 h-5 border border-amber-100/30 rounded" />
              </div>
            </div>
            
            {/* Middle: Card Number Mask */}
            <div className="my-2">
              <span className="text-base font-mono tracking-[0.2em] font-bold text-white/80">
                •••• •••• •••• {tenant.cardLastFour || '4242'}
              </span>
            </div>
            
            {/* Bottom Card Holder Details */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">Resident Card</span>
                <span className="text-xs font-bold tracking-wide mt-0.5">{tenant.name}</span>
              </div>
              <div className="flex flex-col items-end">
                {totalBalance > 0 ? (
                  <Badge className="bg-red-500/30 text-red-100 hover:bg-red-500/30 border-transparent text-[9px] font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="size-3" /> Due
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/30 border-transparent text-[9px] font-bold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Clear
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auto-pay and Action Panel */}
      <motion.div variants={itemVariants} className="glass-card border-transparent rounded-2xl p-4 flex items-center justify-between shadow-none">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Default Auto-Pay Card</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Visa ending in {tenant.cardLastFour || '4242'}</span>
        </div>
        {totalBalance > 0 && activePayBill ? (
          <Button 
            className="bg-primary hover:bg-primary/95 glow-primary font-bold text-xs py-2 px-4 rounded-xl transition-all active:scale-[0.97]"
            onClick={() => handleOpenPay(activePayBill.id)}
          >
            Pay Now
          </Button>
        ) : (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[10px] font-bold py-0.5 px-3 rounded-full uppercase">
            Active
          </Badge>
        )}
      </motion.div>

      {/* Ledger Summary List */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Ledger & Statements</h2>
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <div 
              key={bill.id} 
              className="p-4 rounded-2xl bg-white/40 dark:bg-slate-950/25 border border-white/20 dark:border-white/5 flex items-center justify-between hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  bill.status === 'Paid' 
                    ? 'bg-slate-100/50 text-slate-650 dark:bg-slate-900 dark:text-slate-350' 
                    : 'bg-destructive/10 text-destructive shadow-sm shadow-destructive/5'
                }`}>
                  {getBillIcon(bill.category)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {bill.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-semibold">
                    {bill.status === 'Paid' ? `Paid via ${bill.dueDate === 'Paid' ? 'Card' : 'UPI'}` : bill.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{bill.amount.toFixed(2)}
                  </span>
                  <Badge 
                    className={`text-[9px] font-bold py-0.5 px-2 mt-1 border-transparent rounded-full ${
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
                    className="rounded-full text-slate-400 hover:text-primary active:scale-95 transition-transform cursor-pointer"
                    title="Download Receipt"
                    onClick={() => handleDownloadReceipt(bill)}
                  >
                    <Download className="size-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold px-3 py-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 active:scale-[0.97] rounded-xl cursor-pointer"
                    onClick={() => handleOpenPay(bill.id)}
                  >
                    Pay
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Confirmation Modal */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-[90%] rounded-3xl sm:max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {paymentStep === 'choose_method' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Select Payment Method</DialogTitle>
                  <DialogDescription className="text-xs text-slate-550 dark:text-slate-400">
                    Choose how you would like to clear your outstanding bill.
                  </DialogDescription>
                </DialogHeader>

                {selectedBill && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-805 flex justify-between items-center my-1">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {bills.find(b => b.id === selectedBill)?.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Due date: {bills.find(b => b.id === selectedBill)?.dueDate}</p>
                    </div>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
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
                        setPaymentStep('upi_details');
                      }
                    }}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/10">
                        <Smartphone className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">UPI Payments (Instant)</span>
                          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[8px] font-black py-0.5 px-1.5 rounded-full uppercase tracking-wider">
                            FREE
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Pay via PhonePe, GPay, Paytm, or BHIM</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setPaymentStep('card_confirm')}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-650 dark:bg-slate-850 dark:text-slate-350 flex items-center justify-center shrink-0">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Saved Credit Card</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Visa ending in *{tenant.cardLastFour || '4242'}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </button>
                </div>

                <DialogFooter className="mt-4 border-t border-slate-100/50 dark:border-slate-850 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl text-xs font-semibold cursor-pointer"
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
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader className="flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-550 absolute -left-2 top-0 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8">Card Payment</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Process checkout for your pending utility bill using your registered payment card.
                </DialogDescription>

                {selectedBill && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-850 flex justify-between items-center my-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {bills.find(b => b.id === selectedBill)?.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">Card ending in *{tenant.cardLastFour || '4242'}</p>
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1 text-xs font-semibold cursor-pointer"
                    onClick={() => setPaymentStep('choose_method')}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button 
                    className="rounded-xl bg-primary hover:bg-primary/95 glow-primary font-bold flex-1 text-xs cursor-pointer"
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
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                className="flex flex-col gap-4"
              >
                <DialogHeader className="flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 absolute -left-2 top-0 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8">Select UPI App</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-500">
                  Select an app to pay. It will open and prefill owner details and amount of <span className="font-extrabold text-slate-800 dark:text-slate-100">₹{bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}</span>.
                </DialogDescription>

                {/* Owner info callout */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-3.5 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">To Owner:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-205">{tenant.pgUpiName || tenant.pgUpiRegisteredName || tenant.pgName || "PG Owner"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">UPI ID / Phone:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-205 font-mono">{tenant.pgUpiId || tenant.pgUpiNumber || "pgowner@upi"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-1">
                  {/* Google Pay */}
                  <button
                    onClick={() => handleLaunchUpi('gpay')}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shadow-xs border border-blue-100/20">
                      <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7.5v-6H9v6zm4 0h-1.5v-2.5h-2V13h2v-2H13v6zm4.5-4.5h-2v2h2V16h-2v1H15v-6h3.5v1.5z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Google Pay</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => handleLaunchUpi('phonepe')}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-650 shadow-xs border border-purple-100/20">
                      <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 9.9 13 10.5 13 12h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">PhonePe</span>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => handleLaunchUpi('paytm')}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-500 shadow-xs border border-sky-100/20">
                      <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 16H7v-2h10v2zm-2-4H9v-2h6v2zm2-4H7V8h10v2z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Paytm</span>
                  </button>

                  {/* BHIM */}
                  <button
                    onClick={() => handleLaunchUpi('bhim')}
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.97] transition-all text-center cursor-pointer"
                  >
                    <div className="size-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shadow-xs border border-emerald-100/20">
                      <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
                        <path d="M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">BHIM UPI</span>
                  </button>
                </div>

                <button
                  onClick={() => handleLaunchUpi('generic')}
                  className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <Smartphone className="size-4" />
                  Show All Installed Apps
                </button>
              </motion.div>
            )}
            {paymentStep === 'upi_details' && (
              <motion.div
                key="upi_details"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                className="flex flex-col items-center gap-4 text-center w-full"
              >
                <DialogHeader className="w-full flex flex-row items-center gap-2 relative">
                  <button 
                    onClick={() => setPaymentStep('choose_method')}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-505 absolute -left-2 top-0 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white pl-8 w-full text-center pr-8">UPI Payment Details</DialogTitle>
                </DialogHeader>

                <DialogDescription className="text-xs text-slate-550 dark:text-slate-400 px-2 leading-relaxed">
                  Please transfer the exact amount using any UPI app to the address details below.
                </DialogDescription>

                {selectedBill && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Copy Details Container */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4 rounded-3xl w-full flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-955 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">UPI ID / Address</span>
                          <span className="text-xs font-mono font-extrabold text-slate-850 dark:text-slate-200 select-all mt-0.5">
                            {tenant.pgUpiId || tenant.pgUpiNumber || "pgowner@upi"}
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(tenant.pgUpiId || tenant.pgUpiNumber || "pgowner@upi");
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          variant="ghost"
                          className="h-8 text-[10px] font-bold text-primary px-3 hover:bg-primary/10 rounded-xl flex items-center gap-1"
                        >
                          <Copy className="size-3.5" />
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>

                    {/* Payee Info */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 w-full text-left flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500">Payee (Owner):</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{tenant.pgUpiName || tenant.pgUpiRegisteredName || tenant.pgName || "PG Owner"}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2 mt-2">
                        <span className="font-bold text-slate-500">Amount Due:</span>
                        <span className="font-black text-lg text-primary">
                          ₹{bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="w-full flex flex-col sm:flex-row gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex-1 text-xs font-semibold cursor-pointer"
                    onClick={() => setPaymentStep('choose_method')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-xl bg-primary hover:bg-primary/95 glow-primary font-bold flex-1 text-xs cursor-pointer"
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
                transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                className="flex flex-col items-center gap-4 text-center py-4"
              >
                <div className="size-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center animate-bounce mb-2 border border-amber-500/20 shadow-inner">
                  <AlertCircle className="size-8" />
                </div>

                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Verify Payment</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Did you complete the payment of <span className="font-black text-slate-900 dark:text-white">₹{bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}</span> inside your UPI app?
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2.5 w-full mt-4">
                  <Button 
                    className="rounded-xl bg-primary hover:bg-primary/95 glow-primary font-bold w-full h-12 text-xs cursor-pointer"
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
                    className="rounded-xl w-full h-12 text-xs font-semibold cursor-pointer"
                    onClick={() => {
                      if (isMobile) {
                        setPaymentStep('upi_apps');
                      } else {
                        setPaymentStep('upi_details');
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
    </motion.div>
  );
}
