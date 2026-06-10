"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { 
  User, 
  QrCode, 
  FileText, 
  Scale, 
  LogOut,
  CheckCircle2,
  Lock,
  Edit2,
  ChevronRight,
  Sparkles
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile & Digital ID
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Access your digital resident passport and lease documents.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Digital Resident Card & Gate QR Code */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col gap-6">
          <Card className="bg-gradient-to-br from-indigo-600 via-primary to-accent text-primary-foreground border-transparent overflow-hidden shadow-[0_20px_50px_rgba(88,67,233,0.2)] relative transition-all duration-300 hover:shadow-xl group rounded-[28px]">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #ffffff 0%, transparent 60%)' }} />
            
            <CardContent className="p-6 flex flex-col gap-6 z-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="size-2.5 animate-spin" />
                    Digital Passport
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-white">{tenant.name}</h2>
                  
                  <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full w-max border border-white/10">
                    <CheckCircle2 className="size-3.5 text-emerald-400 fill-emerald-400/20" />
                    <span className="text-[10px] font-bold text-white">Verified Resident</span>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-white/20 text-white flex items-center justify-center font-bold text-lg uppercase select-none">
                  {tenant.name.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              </div>

              {/* Room Config Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div>
                  <span className="text-[8px] opacity-75 uppercase tracking-wider font-bold text-white/70">Room Code</span>
                  <p className="text-xs font-bold mt-0.5 text-white">{tenant.room}</p>
                </div>
                <div>
                  <span className="text-[8px] opacity-75 uppercase tracking-wider font-bold text-white/70">PG Bed Allocation</span>
                  <p className="text-xs font-bold mt-0.5 text-white">{tenant.bed}</p>
                </div>
              </div>
            </CardContent>

            {/* Interactive Gate Access Pass Drawer/Triggers */}
            <div 
              className="bg-black/15 border-t border-white/10 p-4.5 flex items-center justify-between cursor-pointer hover:bg-black/25 transition-all"
              onClick={() => setShowGatePass(true)}
            >
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold flex items-center gap-1.5 text-white">
                  <QrCode className="size-4 text-emerald-400" />
                  Gate Access Pass
                </h3>
                <p className="text-[10px] text-white/60">Scan QR Code at security turnstiles</p>
              </div>
              <div className="w-11 h-11 bg-white p-1.5 rounded-xl border border-white/10 flex-shrink-0 flex items-center justify-center shadow-inner">
                <div className="w-full h-full rounded bg-slate-100 flex items-center justify-center">
                  <QrCode className="size-8 text-slate-800" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Column: Information & Document Links */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col gap-6">
          {/* Personal Information */}
          <Card className="glass-card border-transparent shadow-none rounded-3xl">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/40 dark:border-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <User className="size-4.5 text-primary" />
                  Personal Information
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="text-primary hover:text-primary font-bold text-xs h-8 flex items-center gap-1 px-2.5 hover:bg-primary/10 rounded-xl cursor-pointer"
                >
                  <Edit2 className="size-3" />
                  Edit
                </Button>
              </div>

              <div className="flex flex-col text-xs font-semibold">
                <div className="flex flex-col sm:flex-row sm:justify-between py-3.5 border-b border-slate-100/30 dark:border-slate-900/30 gap-1">
                  <span className="text-slate-400 dark:text-slate-500 w-1/3">Email Address</span>
                  <span className="text-slate-850 dark:text-slate-205">{emailVal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3.5 border-b border-slate-100/30 dark:border-slate-900/30 gap-1">
                  <span className="text-slate-400 dark:text-slate-500 w-1/3">Phone Number</span>
                  <span className="text-slate-850 dark:text-slate-205">{phoneVal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3.5 border-b border-slate-100/30 dark:border-slate-900/30 gap-1">
                  <span className="text-slate-400 dark:text-slate-500 w-1/3">Emergency Contact</span>
                  <span className="text-slate-850 dark:text-slate-205">{emergencyContact}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-3.5 gap-1">
                  <span className="text-slate-400 dark:text-slate-500 w-1/3">Move-in Date</span>
                  <span className="text-slate-850 dark:text-slate-205">{tenant.joiningDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lease Agreement card */}
            <Card 
              className="glass-card glass-card-hover border-transparent shadow-none cursor-pointer p-0 group rounded-3xl"
              onClick={() => setIsLeaseOpen(true)}
            >
              <CardContent className="p-4.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(14,165,233,0.06)]">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Lease Agreement</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Valid till {tenant.leaseEndDate || 'Dec 14, 2026'}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-350 dark:text-slate-700 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>

            {/* House Rules card */}
            <Card 
              className="glass-card glass-card-hover border-transparent shadow-none cursor-pointer p-0 group rounded-3xl"
              onClick={() => setIsRulesOpen(true)}
            >
              <CardContent className="p-4.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/10 shadow-[0_4px_12px_rgba(245,158,11,0.06)]">
                    <Scale className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">House Rules</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Community Guidelines</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-355 dark:text-slate-700 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </div>

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full border-slate-200 dark:border-slate-800 hover:bg-destructive/5 hover:text-destructive text-slate-605 dark:text-slate-350 text-xs font-bold py-5.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-none cursor-pointer bg-white/30 dark:bg-slate-950/20"
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </motion.div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
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
                className="w-full text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</Label>
              <Input 
                id="edit-phone"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-emergency" className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact</Label>
              <Input 
                id="edit-emergency"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                required
                className="w-full text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="mt-2 flex gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="flex-1 text-xs rounded-xl cursor-pointer" disabled={isSavingProfile}>Cancel</Button>} />
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl cursor-pointer" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* House Rules Dialog */}
      <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">PG House Rules</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Please respect these community agreements at {tenant.pgName || 'NestHaven PG'}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4 max-h-[300px] overflow-y-auto pr-1">
            {houseRules.map((rule, idx) => (
              <div key={idx} className="flex gap-3.5 items-start pb-3.5 border-b last:border-0 border-slate-100/50 dark:border-slate-900/50">
                <div className="w-5.5 h-5.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-xs border border-primary/5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rule.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed font-semibold">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button className="w-full bg-primary hover:bg-primary/95 font-bold text-xs rounded-xl cursor-pointer">I Understand</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lease Agreement Dialog */}
      <Dialog open={isLeaseOpen} onOpenChange={setIsLeaseOpen}>
        <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Lease Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Your active housing lease summary contract.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4 text-xs font-semibold">
            <div className="flex justify-between py-2 border-b border-slate-100/40 dark:border-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500">PG Name</span>
              <span className="text-slate-900 dark:text-white">{tenant.pgName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100/40 dark:border-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500">Lease Commencement</span>
              <span className="text-slate-900 dark:text-white">{tenant.joiningDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100/40 dark:border-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500">Lease Expiry</span>
              <span className="text-slate-900 dark:text-white">{tenant.leaseEndDate || 'Dec 14, 2026'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100/40 dark:border-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500">Monthly Rent Dues</span>
              <span className="text-slate-900 dark:text-white">
                {(() => {
                  const rentBill = bills.find(b => b.category === 'Rent');
                  return rentBill 
                    ? `₹${rentBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month` 
                    : '₹1,250.00 / month';
                })()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 dark:text-slate-500">Security Deposit Refundable</span>
              <span className="text-slate-900 dark:text-white">{tenant.deposit || '₹2,500.00'}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 flex gap-2.5 mt-2">
              <Lock className="size-4.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                To download the signed PDF contract copy, please access the portal on a desktop device.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button className="w-full bg-primary hover:bg-primary/95 font-bold text-xs rounded-xl cursor-pointer">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Gate Access QR Dialog */}
      <Dialog open={showGatePass} onOpenChange={setShowGatePass}>
        <DialogContent className="max-w-xs p-6 flex flex-col items-center gap-4 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader className="text-center items-center">
            <DialogTitle className="text-base font-bold">Gate Access QR</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {tenant.pgName || 'NestHaven PG'} Main Gate
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-br from-indigo-600 via-primary to-accent w-full text-white p-5.5 rounded-[22px] flex flex-col items-center gap-4 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #ffffff 0%, transparent 60%)' }} />
            
            <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-inner relative">
              <div className="w-full h-full rounded flex items-center justify-center bg-slate-100 text-slate-800">
                <QrCode className="size-24 text-slate-800 animate-pulse" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base leading-tight">{tenant.name}</h3>
              <span className="text-[10px] bg-white/20 text-white font-bold py-0.5 px-2.5 rounded-full inline-block mt-1">
                Room {tenant.room.split(' ')[1] || tenant.room}
              </span>
            </div>

            <div className="w-full bg-white/10 p-2.5 rounded-xl text-center text-[9px] border border-white/10">
              <span className="opacity-80 block uppercase text-[7px] font-bold tracking-wider">Passcode token</span>
              <span className="font-mono font-bold mt-0.5 block">{tenant.gateId || 'PASS-9872'}</span>
            </div>
          </div>

          <DialogClose render={<Button className="w-full bg-primary hover:bg-primary/95 font-bold text-xs rounded-xl cursor-pointer">Done</Button>} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
