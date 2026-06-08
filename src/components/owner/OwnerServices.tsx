"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Wrench, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const OwnerServices: React.FC = () => {
  const { allComplaints, updateComplaintStatus } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    setUpdatingId(id);
    let nextStatus: 'pending' | 'in-progress' | 'resolved' = 'in-progress';
    if (currentStatus === 'pending') {
      nextStatus = 'in-progress';
    } else if (currentStatus === 'in-progress') {
      nextStatus = 'resolved';
    } else {
      nextStatus = 'pending';
    }

    setTimeout(async () => {
      await updateComplaintStatus(id, nextStatus);
      setUpdatingId(null);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'resolved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-transparent text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
            <CheckCircle2 className="size-3" />
            Resolved
          </Badge>
        );
      case 'in-progress':
      case 'in_progress':
        return (
          <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/10 border-transparent text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
            <Clock className="size-3" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 border-transparent text-[10px] font-semibold flex items-center gap-1 py-0.5 px-2">
            <Clock className="size-3" />
            Open
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Service Tickets
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage tenant complaints and repair requests.
        </p>
      </header>

      {/* Complaints List */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Active Tickets</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {allComplaints.filter(c => c.status !== 'resolved').length} Open
            </Badge>
          </div>

          {allComplaints.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No service requests filed.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allComplaints.map((c) => {
                const tenantName = c.tenants?.users?.name || 'Unknown Resident';
                const roomNumber = c.tenants?.rooms?.room_number || '302';
                
                return (
                  <div 
                    key={c.id} 
                    className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                          <Wrench className="size-4.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {c.title}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            Raised by {tenantName} (Room {roomNumber}) • {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(c.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-10">
                      {c.description}
                    </p>

                    {c.status !== 'resolved' && (
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] font-semibold h-8 cursor-pointer flex items-center gap-1 active:scale-95"
                          onClick={() => handleStatusChange(c.id.toString(), c.status)}
                          disabled={updatingId === c.id.toString()}
                        >
                          {updatingId === c.id.toString() ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <ChevronRight className="size-3" />
                              {c.status === 'pending' ? 'Start Progress' : 'Mark Resolved'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
