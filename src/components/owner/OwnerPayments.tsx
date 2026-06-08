"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CreditCard, 
  Home, 
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const OwnerPayments: React.FC = () => {
  const { allPayments, markPaymentAsPaid } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getBillIcon = (amount: number) => {
    return amount > 1000 ? <Home className="size-5" /> : <CreditCard className="size-5" />;
  };

  const handleMarkPaid = async (id: string) => {
    setUpdatingId(id);
    // Tactile feedback
    setTimeout(async () => {
      await markPaymentAsPaid(id);
      setUpdatingId(null);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payments Ledger
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor and update rental payments across all rooms.
        </p>
      </header>

      {/* Ledger list */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Billing History</h2>
        
        {allPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
            No payments records found.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {allPayments.map((p) => {
              const amount = parseFloat(p.amount);
              const isPaid = p.status === 'paid';
              const tenantName = p.tenants?.users?.name || 'Unknown Tenant';
              const roomNumber = p.tenants?.rooms?.room_number || '302';
              
              return (
                <div 
                  key={p.id} 
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isPaid 
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {getBillIcon(amount)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tenantName} (Room {roomNumber})
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.month} {amount > 1000 ? 'Rent' : 'Utility'} • {isPaid ? `Paid via ${p.payment_method || 'Online'}` : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ${amount.toFixed(2)}
                      </span>
                      <Badge 
                        className={`text-[9px] font-bold py-0.5 px-2 mt-1 border-transparent ${
                          isPaid 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' 
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/10'
                        }`}
                      >
                        {isPaid ? 'Paid' : p.status.toUpperCase()}
                      </Badge>
                    </div>

                    {!isPaid && (
                      <Button
                        size="sm"
                        className="text-xs font-semibold px-3 py-1 bg-primary active:scale-[0.98] transition-transform flex items-center gap-1"
                        onClick={() => handleMarkPaid(p.id.toString())}
                        disabled={updatingId === p.id.toString()}
                      >
                        {updatingId === p.id.toString() ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="size-3.5" />
                            Mark Paid
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
