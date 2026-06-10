"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, Check, X, Package, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export function IncomingGateRequestModal() {
  const { incomingRequest, setIncomingRequest, updateVisitorApproval } = useApp();

  if (!incomingRequest) return null;

  const handleAction = async (status: 'approved' | 'rejected' | 'leave_at_gate') => {
    await updateVisitorApproval(incomingRequest.id.toString(), status);
  };

  const isDelivery = incomingRequest.visitor_type === 'delivery';

  return (
    <Dialog open={incomingRequest !== null} onOpenChange={(open) => !open && setIncomingRequest(null)}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-900 shadow-2xl overflow-hidden">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2 animate-pulse">
            <ShieldAlert className="size-8 text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
            Incoming Gate Request
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            A visitor is at the main gate requesting entry to your room.
          </DialogDescription>
        </DialogHeader>

        {/* Visitor Card */}
        <div className="my-4 bg-slate-50 dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-100/60 dark:border-slate-800/60 flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            {incomingRequest.photo_url ? (
              <img
                src={incomingRequest.photo_url}
                alt="Visitor"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-450 shrink-0 font-extrabold text-xs">
                No Photo
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                {incomingRequest.visitor_name}
              </span>
              <span className="text-[10px] bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400 py-0.5 px-2.5 rounded-full font-bold w-fit mt-1">
                {incomingRequest.visitor_type.toUpperCase()}
              </span>
              {incomingRequest.phone && (
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                  Phone: {incomingRequest.phone}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col">
              <span className="uppercase tracking-wide text-[8px] text-slate-400">Purpose</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{incomingRequest.purpose || 'Personal'}</span>
            </div>
            {isDelivery && incomingRequest.delivery_company && (
              <div className="flex flex-col">
                <span className="uppercase tracking-wide text-[8px] text-slate-400">Company</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{incomingRequest.delivery_company}</span>
              </div>
            )}
            {incomingRequest.vehicle_number && (
              <div className="flex flex-col">
                <span className="uppercase tracking-wide text-[8px] text-slate-400">Vehicle</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{incomingRequest.vehicle_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            onClick={() => handleAction('rejected')}
            variant="outline"
            className="flex-1 border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-950/30 text-xs font-bold py-5.5 rounded-xl cursor-pointer"
          >
            <X className="size-4 shrink-0 mr-1" />
            Deny Entry
          </Button>

          {isDelivery && (
            <Button
              onClick={() => handleAction('leave_at_gate')}
              variant="outline"
              className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:hover:bg-blue-950/30 text-xs font-bold py-5.5 rounded-xl cursor-pointer"
            >
              <Package className="size-4 shrink-0 mr-1" />
              Leave at Gate
            </Button>
          )}

          <Button
            onClick={() => handleAction('approved')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-5.5 rounded-xl cursor-pointer shadow-md shadow-emerald-600/10"
          >
            <Check className="size-4 shrink-0 mr-1" />
            Approve Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
