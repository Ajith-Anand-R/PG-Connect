"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CreditCard, 
  Download, 
  Home,
  CheckCircle2,
  Wrench,
  AlertCircle
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

export default function PaymentsPage() {
  const { bills, payBill } = useApp();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate unpaid balance dynamically
  const unpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  const totalBalance = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);

  // Get active pay now item
  const activePayBill = unpaidBills[0];

  const handleOpenPay = (id: string) => {
    setSelectedBill(id);
    setPayModalOpen(true);
  };

  const handleProcessPayment = () => {
    if (!selectedBill) return;
    setIsProcessing(true);
    setTimeout(() => {
      payBill(selectedBill);
      setIsProcessing(false);
      setPayModalOpen(false);
      setSelectedBill(null);
    }, 1500);
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
            
            {totalBalance > 0 ? (
              <p className="text-xs text-destructive font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                Due soon: Electricity Bill
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
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Visa ending in 4242</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 dark:text-primary-foreground">
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
                    {bill.status === 'Paid' ? 'Paid via Auto-pay' : 'Due in 3 days'}
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
                    className="text-xs font-semibold px-3 py-1 border-slate-200 hover:bg-slate-50 dark:border-slate-800 active:scale-[0.98]"
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
        <DialogContent className="max-w-[90%] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Process checkout for your pending utility bill using your registered payment card.
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 my-2 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {bills.find(b => b.id === selectedBill)?.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Card ending in *4242</p>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ${bills.find(b => b.id === selectedBill)?.amount.toFixed(2)}
              </span>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setPayModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Authorizing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
