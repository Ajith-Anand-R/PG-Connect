"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  User, 
  QrCode, 
  FileText, 
  Scale, 
  LogOut,
  CheckCircle2,
  Lock,
  Edit2,
  ChevronRight
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { tenant, logout, bills, updateProfile } = useApp();
  
  // Local state to simulate profile edit
  const [phoneVal, setPhoneVal] = useState(tenant.phone);
  const [emailVal, setEmailVal] = useState(tenant.email);
  const [emergencyContact, setEmergencyContact] = useState(tenant.emergencyContact || "Not Configured");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setPhoneVal(tenant.phone);
    setEmailVal(tenant.email);
    setEmergencyContact(tenant.emergencyContact || "Not Configured");
  }, [tenant]);
  /* eslint-enable react-hooks/set-state-in-effect */
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isLeaseOpen, setIsLeaseOpen] = useState(false);
  const [showGatePass, setShowGatePass] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const { error } = await updateProfile(emailVal, phoneVal, emergencyContact);
    setIsSavingProfile(false);
    if (error) {
      alert("Error saving profile: " + error);
    } else {
      setIsEditOpen(false);
    }
  };

  const houseRules = [
    { title: "Quiet Hours", desc: "10:00 PM to 8:00 AM. Please keep voice levels and media playback volume low." },
    { title: "Guest Policy", desc: "All overnight visitors must be registered using the Guest Pass Manager 24h in advance." },
    { title: "Shared Spaces", desc: "Clean up kitchen counters and common room tables immediately after use." },
    { title: "Waste Disposal", desc: "Dispose of garbage in designated block refuse chute bins daily." },
    { title: "No Smoking", desc: "Strictly forbidden inside rooms and wing corridors. Use rooftop smoking zones." }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile & Digital ID
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Access your digital resident passport and lease documents.
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Digital Resident Card & Gate QR Code */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="bg-primary text-primary-foreground border-transparent overflow-hidden shadow-lg relative transition-all duration-300 hover:shadow-xl group">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #ffffff 0%, transparent 60%)' }} />
            
            <CardContent className="p-6 flex flex-col gap-6 z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest opacity-80">
                    Digital Resident Passport
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-white dark:text-primary-foreground">{tenant.name}</h2>
                  
                  <div className="inline-flex items-center gap-1 bg-white/10 dark:bg-black/10 px-2.5 py-0.5 rounded-full w-max border border-white/5 dark:border-black/5">
                    <CheckCircle2 className="size-3.5 text-emerald-400 dark:text-emerald-600 fill-emerald-400/20" />
                    <span className="text-[10px] font-bold text-white dark:text-primary-foreground">Verified Resident</span>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-md shrink-0 bg-white/20 text-white flex items-center justify-center font-bold text-xl uppercase select-none">
                  {tenant.name.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              </div>

              {/* Room Config Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white/10 dark:bg-black/10 p-4 rounded-xl border border-white/5 dark:border-black/5 backdrop-blur-xs">
                <div>
                  <span className="text-[9px] opacity-75 uppercase tracking-wide font-semibold text-white/80 dark:text-primary-foreground/80">Room Code</span>
                  <p className="text-sm font-bold mt-0.5 text-white dark:text-primary-foreground">{tenant.room}</p>
                </div>
                <div>
                  <span className="text-[9px] opacity-75 uppercase tracking-wide font-semibold text-white/80 dark:text-primary-foreground/80">PG Bed Allocation</span>
                  <p className="text-sm font-bold mt-0.5 text-white dark:text-primary-foreground">{tenant.bed}</p>
                </div>
              </div>
            </CardContent>

            {/* Interactive Gate Access Pass Drawer/Triggers */}
            <div 
              className="bg-slate-900/10 dark:bg-black/20 border-t border-white/5 dark:border-black/5 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/20 dark:hover:bg-black/30 transition-all"
              onClick={() => setShowGatePass(true)}
            >
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold flex items-center gap-1.5 text-white dark:text-primary-foreground">
                  <QrCode className="size-4 text-emerald-400 dark:text-emerald-600" />
                  Gate Access Pass
                </h3>
                <p className="text-[10px] text-white/70 dark:text-primary-foreground/75">Scan QR Code at security turnstiles</p>
              </div>
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-white/15 flex-shrink-0 flex items-center justify-center shadow-inner">
                {/* Styled mock QR grid */}
                <div className="w-full h-full rounded bg-slate-100 flex items-center justify-center">
                  <QrCode className="size-8 text-slate-800" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Information & Document Links */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Personal Information */}
          <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <User className="size-4.5 text-primary" />
                  Personal Information
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="text-primary hover:text-primary-container font-semibold text-xs h-8 flex items-center gap-1 px-2.5"
                >
                  <Edit2 className="size-3" />
                  Edit
                </Button>
              </div>

              <div className="flex flex-col text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-50 dark:border-slate-900 gap-1">
                  <span className="text-slate-400 w-1/3">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{emailVal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-50 dark:border-slate-900 gap-1">
                  <span className="text-slate-400 w-1/3">Phone Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{phoneVal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-50 dark:border-slate-900 gap-1">
                  <span className="text-slate-400 w-1/3">Emergency Contact</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{emergencyContact}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3 gap-1">
                  <span className="text-slate-400 w-1/3">Move-in Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant.joiningDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lease Agreement card */}
            <Card 
              className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group"
              onClick={() => setIsLeaseOpen(true)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lease Agreement</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Valid till {tenant.leaseEndDate || 'Dec 14, 2026'}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>

            {/* House Rules card */}
            <Card 
              className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group"
              onClick={() => setIsRulesOpen(true)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Scale className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">House Rules</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Community guidelines</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </div>

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full border-slate-200 hover:bg-destructive/5 hover:text-destructive text-slate-600 dark:text-slate-400 text-xs font-bold py-5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Profile Info</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Update your contact details for landlord communications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
              <Input 
                id="edit-email"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</Label>
              <Input 
                id="edit-phone"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-emergency" className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact</Label>
              <Input 
                id="edit-emergency"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs" disabled={isSavingProfile}>Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary text-xs font-bold" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* House Rules Dialog */}
      <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">PG House Rules</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Please respect these community agreements at NestHaven PG.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {houseRules.map((rule, idx) => (
              <div key={idx} className="flex gap-3 items-start pb-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
                <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rule.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button className="w-full bg-primary font-bold text-xs">I Understand</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lease Agreement Dialog */}
      <Dialog open={isLeaseOpen} onOpenChange={setIsLeaseOpen}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Lease Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Your active housing lease summary contract.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">PG Name</span>
              <span className="font-semibold text-slate-900 dark:text-white">{tenant.pgName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Lease Commencement</span>
              <span className="font-semibold text-slate-900 dark:text-white">{tenant.joiningDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Lease Expiry</span>
              <span className="font-semibold text-slate-900 dark:text-white">{tenant.leaseEndDate || 'Dec 14, 2026'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Monthly Rent Dues</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {(() => {
                  const rentBill = bills.find(b => b.category === 'Rent');
                  return rentBill 
                    ? `$${rentBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month` 
                    : '$1,250.00 / month';
                })()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Security Deposit Refundable</span>
              <span className="font-semibold text-slate-900 dark:text-white">{tenant.deposit || '$2,500.00'}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex gap-2.5 mt-2">
              <Lock className="size-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-normal">
                To download the signed PDF contract copy, please access the portal on a desktop device.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button className="w-full bg-primary font-bold text-xs">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Gate Access QR Dialog */}
      <Dialog open={showGatePass} onOpenChange={setShowGatePass}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-base font-bold">Gate Access QR</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              NestHaven PG Main Gate
            </DialogDescription>
          </DialogHeader>

          <div className="bg-primary w-full text-white p-5 rounded-2xl flex flex-col items-center gap-4 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #ffffff 0%, transparent 60%)' }} />
            
            <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner relative">
              <div className="w-full h-full rounded flex items-center justify-center bg-slate-100 text-slate-800">
                <QrCode className="size-24 text-slate-800" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base leading-tight">{tenant.name}</h3>
              <span className="text-[10px] bg-white/20 text-white font-bold py-0.5 px-2.5 rounded-full inline-block mt-1">
                Room {tenant.room.split(' ')[1]}
              </span>
            </div>

            <div className="w-full bg-white/10 p-2.5 rounded-xl text-center text-[9px] border border-white/10">
              <span className="opacity-80 block uppercase text-[7px] font-semibold">Passcode token</span>
              <span className="font-mono font-bold mt-0.5 block">{tenant.gateId}</span>
            </div>
          </div>

          <DialogClose render={<Button className="w-full bg-primary font-bold text-xs">Done</Button>} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
