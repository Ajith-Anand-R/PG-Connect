"use client";

import React, { useState } from 'react';
import { useApp, GuestPass } from '@/context/AppContext';
import { 
  UserCheck, 
  Plus, 
  QrCode, 
  Calendar, 
  Clock, 
  User, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  History,
  Check,
  Share2
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
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GuestPassPage() {
  const { guestPasses, addGuestPass, tenant } = useApp();
  const [isNewPassOpen, setIsNewPassOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GuestPass | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState('14:00');
  const [exitTime, setExitTime] = useState('22:00');

  // Hardcoded historical passes to match the exact designs
  const historyPasses = [
    { id: 'h-1', visitorName: 'Michael Johnson', relationship: 'Friend', phone: '+1 (555) 882-9912', date: 'Oct 12, 2026', status: 'Expired', type: 'Day Pass' },
    { id: 'h-2', visitorName: 'Emily Davis', relationship: 'Sister', phone: '+1 (555) 221-4828', date: 'Oct 05, 2026', status: 'Used', type: 'Overnight Parking' },
    { id: 'h-3', visitorName: 'Robert Wilson', relationship: 'Delivery', phone: '+1 (555) 392-1823', date: 'Sep 28, 2026', status: 'Revoked', type: 'Weekend Access' },
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div className="flex flex-col gap-1.5 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Guest Pass Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and manage pre-approved visitor gate clearances.
          </p>
        </div>
      </div>

      {/* Hero Invitation Banner */}
      <div className="bg-primary text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #ffffff 0%, transparent 60%)' }} />
        <div className="z-10 text-center md:text-left">
          <h2 className="text-lg font-bold mb-1">Need to register a guest?</h2>
          <p className="text-xs text-primary-fixed-dim opacity-90 max-w-sm">
            Generate a secure QR access pass for parking slots or building security gates instantly.
          </p>
        </div>
        <Button 
          onClick={() => setIsNewPassOpen(true)}
          className="z-10 bg-white hover:bg-slate-50 text-primary font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm w-full md:w-auto"
        >
          <Plus className="size-4 shrink-0" />
          Create New Pass
        </Button>
      </div>

      {/* Active Passes Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <UserCheck className="size-5 text-primary" />
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Active Passes</h2>
        </div>

        {guestPasses.length === 0 ? (
          <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-transparent py-10">
            <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <QrCode className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">No Active Passes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                  You don't have any pre-approved guests registered for today.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guestPasses.map((pass) => (
              <Card 
                key={pass.id} 
                className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-800">
                        <User className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pass.visitorName}</h4>
                        <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-transparent text-[9px] font-bold py-0.5 px-2 mt-1 rounded-full w-max">
                          {pass.relationship}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{pass.date}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 dark:border-slate-900 pt-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      <span>{pass.entryTime} - {pass.exitTime}</span>
                    </div>
                    
                    <Button 
                      variant="link" 
                      onClick={() => setSelectedPass(pass)}
                      className="text-primary font-bold text-xs p-0 h-auto flex items-center gap-0.5"
                    >
                      View QR Pass <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <History className="size-5 text-secondary" />
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">History Logs</h2>
        </div>

        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-900">
            {historyPasses.map((pass) => (
              <div 
                key={pass.id} 
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                    <User className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pass.visitorName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {pass.type} • {pass.date}
                    </p>
                  </div>
                </div>

                <Badge className={`${
                  pass.status === 'Expired' || pass.status === 'Used'
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                } border-transparent text-[9px] font-bold py-0.5 px-2 rounded-full`}>
                  {pass.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Dialog for Creating Guest Pass */}
      <Dialog open={isNewPassOpen} onOpenChange={setIsNewPassOpen}>
        <DialogContent className="max-w-md w-full p-6">
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
                placeholder="e.g. John Doe"
                required
                className="w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="relationship" className="text-xs font-bold text-slate-700 dark:text-slate-300">Relationship</Label>
                <select 
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full text-xs"
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
                className="w-full text-xs"
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
                  className="w-full text-xs"
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
                  className="w-full text-xs"
                />
              </div>
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs">Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary text-xs font-bold">
                Generate Pass
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Pass Detail Dialog */}
      <Dialog open={selectedPass !== null} onOpenChange={(open) => !open && setSelectedPass(null)}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4">
          {selectedPass && (
            <>
              <DialogHeader className="text-center items-center">
                <DialogTitle className="text-base font-bold">Visitor Access QR</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Pre-Approved Gate Entry Pass
                </DialogDescription>
              </DialogHeader>

              {/* Digital Pass Frame */}
              <div className="bg-primary w-full text-white p-5 rounded-2xl flex flex-col items-center gap-4 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #ffffff 0%, transparent 60%)' }} />
                
                {/* QR Display */}
                <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner relative">
                  {/* Styled mock QR grid */}
                  <div className="w-full h-full rounded flex items-center justify-center bg-slate-100 text-slate-800">
                    <QrCode className="size-24 text-slate-800" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-base leading-tight">{selectedPass.visitorName}</h3>
                  <span className="text-[10px] bg-white/20 text-white font-bold py-0.5 px-2.5 rounded-full inline-block mt-1">
                    {selectedPass.relationship}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 bg-white/10 p-3 rounded-xl text-center text-[10px] border border-white/10">
                  <div>
                    <span className="opacity-80 block uppercase text-[8px] tracking-wider font-semibold">Pass Date</span>
                    <span className="font-bold mt-0.5 block">{selectedPass.date}</span>
                  </div>
                  <div>
                    <span className="opacity-80 block uppercase text-[8px] tracking-wider font-semibold">Duration</span>
                    <span className="font-bold mt-0.5 block">{selectedPass.entryTime} - {selectedPass.exitTime}</span>
                  </div>
                </div>

                <div className="text-[8px] opacity-75 uppercase tracking-wide font-semibold">
                  Invited By: {tenant.name}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <Button 
                  onClick={() => handleShare(selectedPass.qrCodeToken)}
                  className="w-full bg-primary text-xs font-bold flex items-center justify-center gap-1.5"
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
                <DialogClose render={<Button variant="ghost" className="w-full text-xs text-slate-500 font-semibold h-9">Close</Button>} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
