"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  DollarSign, 
  Wrench, 
  Utensils, 
  PlusCircle, 
  ChevronRight,
  Check,
  X,
  ExternalLink,
  FileText,
  AlertCircle,
  Bed,
  Home,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';

export const OwnerDashboard: React.FC = () => {
  const { 
    allTenants, 
    allComplaints, 
    allPayments, 
    allMeals, 
    notices 
  } = useApp();

  // Review states for pending approvals
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [deposit, setDeposit] = useState<string>('');
  const [joinDate, setJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch rooms and beds for the tenant's PG
  useEffect(() => {
    if (!selectedTenant?.pg_id) return;
    
    const fetchRoomsAndBeds = async () => {
      setIsLoadingRooms(true);
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*, beds(*)')
          .eq('pg_id', selectedTenant.pg_id);
          
        if (data) {
          setRooms(data);
        }
      } catch (err) {
        console.error('Error fetching rooms and beds:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    
    fetchRoomsAndBeds();
  }, [selectedTenant?.pg_id]);

  // Auto select first available room and bed
  useEffect(() => {
    if (rooms.length > 0) {
      const availableRoom = rooms.find(r => r.beds?.some((b: any) => b.status === 'available'));
      if (availableRoom) {
        setSelectedRoomId(availableRoom.id.toString());
        const availableBed = availableRoom.beds.find((b: any) => b.status === 'available');
        if (availableBed) {
          setSelectedBedId(availableBed.id.toString());
        }
        setDeposit(availableRoom.rent || '');
      } else {
        setSelectedRoomId('');
        setSelectedBedId('');
        setDeposit('');
      }
    }
  }, [rooms]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id.toString() === roomId);
    if (room) {
      const availableBed = room.beds?.find((b: any) => b.status === 'available');
      setSelectedBedId(availableBed ? availableBed.id.toString() : '');
      setDeposit(room.rent || '');
    } else {
      setSelectedBedId('');
      setDeposit('');
    }
  };

  const handleApprove = async () => {
    if (!selectedTenant || !selectedRoomId || !selectedBedId) return;
    setIsSubmitting(true);
    try {
      // 1. Update the tenant record
      const { error: tenantErr } = await supabase
        .from('tenants')
        .update({
          status: 'active',
          room_id: parseInt(selectedRoomId),
          bed_id: parseInt(selectedBedId),
          deposit: deposit ? parseFloat(deposit) : null,
          join_date: joinDate
        })
        .eq('id', selectedTenant.id);
        
      if (tenantErr) throw tenantErr;
      
      // 2. Update the bed status to occupied
      const { error: bedErr } = await supabase
        .from('beds')
        .update({
          status: 'occupied'
        })
        .eq('id', parseInt(selectedBedId));
        
      if (bedErr) throw bedErr;
      
      // 3. Create initial rent payment for the current month
      const room = rooms.find(r => r.id.toString() === selectedRoomId);
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const rentAmount = room ? parseFloat(room.rent) : 0;
      
      if (rentAmount > 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);
        
        await supabase
          .from('payments')
          .insert({
            tenant_id: selectedTenant.id,
            pg_id: selectedTenant.pg_id,
            amount: rentAmount,
            month: currentMonth,
            status: 'pending',
            due_date: dueDate.toISOString().split('T')[0]
          });
      }
      
      setSelectedTenant(null);
    } catch (err) {
      console.error('Error approving tenant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTenant) return;
    if (!confirm(`Are you sure you want to reject ${selectedTenant.users?.name}'s application?`)) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'rejected'
        })
        .eq('id', selectedTenant.id);
        
      if (error) throw error;
      setSelectedTenant(null);
    } catch (err) {
      console.error('Error rejecting tenant:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Calculate Revenue
  const totalPaid = allPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  
  const totalPending = allPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  // 2. Occupancy Rate
  const activeTenantsCount = allTenants.filter(t => t.status === 'active').length;
  const totalCapacity = 10; // Demo total beds
  const occupancyPercentage = Math.round((activeTenantsCount / totalCapacity) * 100) || 0;

  // 3. Open Complaints
  const openComplaintsCount = allComplaints.filter(c => c.status !== 'resolved').length;

  const pendingTenants = allTenants.filter(t => t.status === 'pending');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Owner Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time operations for NestHaven PG.
        </p>
      </header>

      {/* Pending Approvals Section */}
      {pendingTenants.length > 0 && (
        <Card className="border-amber-100 dark:border-amber-950/30 bg-amber-500/5 dark:bg-amber-500/5 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)]">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-amber-100 dark:border-amber-900/30 pb-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-500" />
                Pending Registrations
              </h2>
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-transparent text-[10px] font-extrabold py-0.5 px-2">
                {pendingTenants.length} Action Needed
              </Badge>
            </div>
            
            <div className="flex flex-col gap-3">
              {pendingTenants.map((pending) => (
                <div 
                  key={pending.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                      {pending.users?.name?.slice(0, 2).toUpperCase() || 'TN'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                        {pending.users?.name || pending.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Joined {pending.dob ? `• DOB: ${pending.dob}` : ''} {pending.phone || pending.users?.phone}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedTenant(pending)}
                    size="sm" 
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stat 1: Revenue */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</span>
              <DollarSign className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                ${totalPending.toLocaleString()} pending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: Occupancy */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Occupancy</span>
              <Users className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{occupancyPercentage}%</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {activeTenantsCount} of {totalCapacity} beds filled
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Complaints */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Tickets</span>
              <Wrench className="size-4 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{openComplaintsCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Needs attention
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: Meals */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tomorrow&apos;s Breakfast</span>
              <Utensils className="size-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{allMeals.breakfastCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Residents opted in
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Grid Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/payments" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            <DollarSign className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Payments Ledger
          </span>
        </Link>

        <Link 
          href="/services" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 transition-colors">
            <Wrench className="size-5" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Manage Tickets
          </span>
        </Link>
      </div>

      {/* Meals Summary Card */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="size-5 text-purple-500" />
              Meal Orders Summary (Tomorrow)
            </h2>
            <Link href="/meals" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Breakdown <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Breakfast</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.breakfastCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Lunch</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.lunchCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
              <p className="text-slate-500">Dinner</p>
              <p className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">{allMeals.dinnerCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices Overview */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="size-5 text-primary" />
              Recent Announcements
            </h2>
            <Link href="/notices" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Manage Notices <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {notices.slice(0, 2).map((notice) => (
              <div 
                key={notice.id} 
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Review Dialog */}
      <Dialog open={selectedTenant !== null} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <DialogContent className="max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
              <FileText className="size-5 text-amber-500" />
              Review Admission Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Verify application details and allocate a room & bed for the tenant.
            </DialogDescription>
          </DialogHeader>

          {selectedTenant && (
            <div className="flex flex-col gap-6 mt-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-850">
                  {selectedTenant.photo_url ? (
                    <img src={selectedTenant.photo_url} alt="Passport Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-500">
                      {selectedTenant.users?.name?.slice(0,2).toUpperCase() || 'TN'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedTenant.users?.name || selectedTenant.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{selectedTenant.users?.phone || selectedTenant.phone} • {selectedTenant.users?.email || selectedTenant.email}</p>
                  <Badge className="bg-amber-500 text-white border-transparent text-[9px] font-extrabold py-0.5 px-2 mt-1.5 rounded-full">
                    Pending Approval
                  </Badge>
                </div>
              </div>

              {/* Sections / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 1: Personal Profile */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Personal Profile</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">DOB</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.dob || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Age / Blood Group</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.age || 'N/A'} / {selectedTenant.blood_group || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Father's Name</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.father_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Father's Contact</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.father_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Identity & Employment */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Identity & Occupation</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">ID ({selectedTenant.id_proof_type || 'ID'})</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.aadhaar_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Occupation</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.occupation || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Office Name</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.office_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expected Stay</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedTenant.expected_stay || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Addresses */}
                <div className="col-span-1 md:col-span-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2 text-xs">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Addresses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">Permanent Address</span>
                      <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{selectedTenant.permanent_address || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Previous Address</span>
                      <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{selectedTenant.previous_address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: References */}
                <div className="col-span-1 md:col-span-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2 text-xs">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">References</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">Reference 1</span>
                      <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{selectedTenant.reference_1 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Reference 2</span>
                      <span className="font-semibold text-slate-900 dark:text-white leading-relaxed">{selectedTenant.reference_2 || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Uploaded Documents */}
                <div className="col-span-1 md:col-span-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Passport Photo */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passport Photo</span>
                      {selectedTenant.photo_url ? (
                        <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                          <img src={selectedTenant.photo_url} alt="Passport Photo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <FileText className="size-8" />
                        </div>
                      )}
                      {selectedTenant.photo_url && (
                        <a 
                          href={selectedTenant.photo_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-1"
                        >
                          View Fullsize <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    {/* ID Proof Document */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aadhaar/ID Proof Document</span>
                      {selectedTenant.id_proof_url ? (
                        <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                          {selectedTenant.id_proof_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <img src={selectedTenant.id_proof_url} alt="ID Proof" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-500 p-2">
                              <FileText className="size-8 text-blue-500" />
                              <span className="text-[9px] font-bold truncate max-w-[80px]">ID_Proof</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <FileText className="size-8" />
                        </div>
                      )}
                      {selectedTenant.id_proof_url && (
                        <a 
                          href={selectedTenant.id_proof_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-1"
                        >
                          View Fullsize <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 6: Room & Bed Allocation */}
                <div className="col-span-1 md:col-span-2 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-950/30 p-5 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bed className="size-4.5 text-amber-500" />
                    Room & Bed Allocation
                  </h4>

                  {isLoadingRooms ? (
                    <div className="flex items-center justify-center p-4 gap-2 text-xs text-slate-500">
                      <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Loading available rooms...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Room Select */}
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="alloc-room" className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Room</Label>
                        <select 
                          id="alloc-room"
                          value={selectedRoomId}
                          onChange={(e) => handleRoomChange(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                        >
                          <option value="">-- Select Room --</option>
                          {rooms.map((room) => {
                            const availableBeds = room.beds?.filter((b: any) => b.status === 'available').length || 0;
                            return (
                              <option key={room.id} value={room.id}>
                                Room {room.room_number} (Floor {room.floor} • {availableBeds}/{room.capacity} Available • ${room.rent}/mo)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Bed Select */}
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="alloc-bed" className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Bed</Label>
                        <select 
                          id="alloc-bed"
                          value={selectedBedId}
                          onChange={(e) => setSelectedBedId(e.target.value)}
                          disabled={!selectedRoomId}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer disabled:opacity-60"
                        >
                          <option value="">-- Select Bed --</option>
                          {rooms
                            .find(r => r.id.toString() === selectedRoomId)
                            ?.beds?.filter((b: any) => b.status === 'available')
                            .map((bed: any) => (
                              <option key={bed.id} value={bed.id}>
                                {bed.bed_number}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      {/* Deposit Paid */}
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="alloc-deposit" className="text-xs font-bold text-slate-700 dark:text-slate-300">Deposit Paid ($)</Label>
                        <Input 
                          id="alloc-deposit"
                          type="number"
                          value={deposit}
                          onChange={(e) => setDeposit(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full text-xs"
                        />
                      </div>

                      {/* Join Date */}
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="alloc-join-date" className="text-xs font-bold text-slate-700 dark:text-slate-300">Joining Date</Label>
                        <div className="relative flex items-center">
                          <Calendar className="size-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <Input 
                            id="alloc-join-date"
                            type="date"
                            value={joinDate}
                            onChange={(e) => setJoinDate(e.target.value)}
                            className="w-full text-xs pl-10"
                          />
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                        <Label htmlFor="alloc-remarks" className="text-xs font-bold text-slate-700 dark:text-slate-300">Remarks (Office Use Only)</Label>
                        <Input 
                          id="alloc-remarks"
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="e.g. Paid in full offline, card setup complete."
                          className="w-full text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={handleReject} 
                  variant="outline" 
                  disabled={isSubmitting}
                  className="border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs"
                >
                  <X className="size-3.5 shrink-0" />
                  Reject Application
                </Button>
                <div className="flex flex-1 gap-2">
                  <Button 
                    onClick={() => setSelectedTenant(null)} 
                    variant="ghost" 
                    disabled={isSubmitting}
                    className="flex-1 text-xs font-bold text-slate-500"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={isSubmitting || !selectedRoomId || !selectedBedId}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="size-3.5 shrink-0" />
                        Approve & Allocate
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
