"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  ArrowLeft,
  Check,
  Calendar,
  Hash,
  Users,
  Briefcase,
  Home
} from 'lucide-react';


export const AuthScreen: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  console.log("AuthScreen render called, isLogin:", isLogin);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Tenant' | 'Owner'>('Tenant');
  const [building, setBuilding] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  
  // Admission Form Additional states
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [expectedStay, setExpectedStay] = useState('');
  const [occupation, setOccupation] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [previousAddress, setPreviousAddress] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [reference1, setReference1] = useState('');
  const [reference2, setReference2] = useState('');

  // Wizard state
  const [step, setStep] = useState(1);
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmailOrPhone('');
    setName('');
    setEmail('');
    setPhone('');
    setBuilding('');
    setPassword('');
    setRole('Tenant');
    setDob('');
    setAge('');
    setBloodGroup('');
    setFatherName('');
    setFatherPhone('');
    setIdProofType('Aadhaar');
    setIdNumber('');
    setExpectedStay('');
    setOccupation('');
    setPermanentAddress('');
    setPreviousAddress('');
    setOfficeName('');
    setOfficeAddress('');
    setOfficePhone('');
    setReference1('');
    setReference2('');
    setStep(1);
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!building.trim()) {
        setError("Invite Token is required.");
        return false;
      }
      if (!email.trim()) {
        setError("Email is required.");
        return false;
      }
      if (!phone.trim()) {
        setError("Phone number is required.");
        return false;
      }
      if (!password.trim()) {
        setError("Password is required.");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!name.trim()) {
        setError("Full Name is required.");
        return false;
      }
      if (!dob) {
        setError("Date of Birth is required.");
        return false;
      }
      if (!age.trim()) {
        setError("Age is required.");
        return false;
      }
      if (!bloodGroup.trim()) {
        setError("Blood Group is required.");
        return false;
      }
      if (!fatherName.trim()) {
        setError("Father's Name is required.");
        return false;
      }
      if (!fatherPhone.trim()) {
        setError("Father's Contact Number is required.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!idNumber.trim()) {
        setError("ID/Aadhaar Number is required.");
        return false;
      }
      if (!expectedStay.trim()) {
        setError("Expected Period of Stay is required.");
        return false;
      }
      if (!occupation.trim()) {
        setError("Occupation is required.");
        return false;
      }
    } else if (currentStep === 4) {
      if (!permanentAddress.trim()) {
        setError("Permanent Address is required.");
        return false;
      }
      if (!previousAddress.trim()) {
        setError("Previous Address is required.");
        return false;
      }
      if (!reference1.trim()) {
        setError("Reference (1) Name, Address & Phone is required.");
        return false;
      }
      if (!reference2.trim()) {
        setError("Reference (2) Name, Address & Phone is required.");
        return false;
      }
    }
    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleLoginSubmit triggered in AuthScreen, emailOrPhone:", emailOrPhone);
    if (!emailOrPhone.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const res = await login(emailOrPhone, password);
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps from 1 to 4
    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    const additionalDetails = {
      dob,
      age: parseInt(age) || null,
      blood_group: bloodGroup,
      father_name: fatherName,
      father_phone: fatherPhone,
      id_proof_type: idProofType,
      aadhaar_number: idNumber,
      expected_stay: expectedStay,
      occupation,
      permanent_address: permanentAddress,
      previous_address: previousAddress,
      office_name: officeName,
      office_address: officeAddress,
      office_phone: officePhone,
      reference_1: reference1,
      reference_2: reference2
    };

    const res = await register(name, email, phone, password, role, building, additionalDetails);
    setIsLoading(false);
    if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f9f9ff] dark:bg-[#0b1120] text-[#101c2d] dark:text-[#f1f5f9] flex flex-col justify-between items-center p-4 md:p-6 overflow-x-hidden relative transition-colors duration-300">
      
      {/* Decorative premium background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl my-auto z-10 flex flex-col items-center">
        {isLogin ? (
          /* --- LOGIN SCREEN --- */
          <div
            className="w-full max-w-[420px] flex flex-col items-center"
          >
              {/* Brand Header */}
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="relative mb-4 flex items-center justify-center">
                  {/* Brand Logo Container */}
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center relative overflow-hidden group">
                    <img 
                      alt="PG Connect Logo" 
                      className="w-12 h-12 rounded-xl object-cover" 
                      src="/logo.png"
                    />
                    {/* Glowing effect inside logo box */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute -z-10 w-24 h-24 bg-[#003d9b]/10 dark:bg-blue-500/10 rounded-full blur-xl" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">PG Connect</h1>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Welcome Back</p>
              </div>

              {/* Form Card */}
              <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <div 
                      className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold p-3.5 rounded-xl animate-in fade-in duration-200"
                    >
                      {error}
                    </div>
                  )}

                  {/* Email/Phone Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block" htmlFor="login-email">Email Address or Phone</label>
                    <div className="relative flex items-center">
                      <Mail className="size-4.5 absolute left-3.5 text-slate-400 dark:text-slate-500" />
                      <input 
                        className="w-full h-11 pl-11 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        id="login-email" 
                        placeholder="name@company.com" 
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" htmlFor="login-password">Password</label>
                      <button 
                        type="button"
                        onClick={() => setError("Password reset is not configured for demo.")}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="size-4.5 absolute left-3.5 text-slate-400 dark:text-slate-500" />
                      <input 
                        className="w-full h-11 pl-11 pr-11 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                        id="login-password" 
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <button 
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" 
                        id="togglePassword" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input 
                      className="w-4 h-4 text-[#003d9b] border-slate-300 dark:border-slate-700 rounded focus:ring-[#003d9b] transition-all cursor-pointer" 
                      id="remember" 
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer" htmlFor="remember">Remember this device</label>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <button 
                      className="w-full h-11 bg-[#003d9b] hover:bg-[#0052cc] text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-slate-950 font-bold rounded-xl shadow-md active:scale-[0.98] flex items-center justify-center gap-2 transition-all border border-transparent disabled:opacity-50 cursor-pointer" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="size-4.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Social Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <span className="relative px-3 bg-white dark:bg-[#131c2e] text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">or continue with</span>
                </div>

                {/* SSO Button */}
                <button 
                  onClick={() => login("google-sso")}
                  disabled={isLoading}
                  className="w-full h-11 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  Google
                </button>
              </div>

              {/* Call-to-action Footer */}
              <p className="mt-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
                Don&apos;t have an account?{' '}
                <button 
                  onClick={toggleMode}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors ml-1"
                  disabled={isLoading}
                >
                  Create an Account
                </button>
              </p>

              {/* Terms Links */}
              <div className="mt-8 flex space-x-3 opacity-60 text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Privacy Policy</a>
                <span>•</span>
                <a className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="#">Terms of Service</a>
              </div>
            </div>
          ) : (
            /* --- REGISTRATION SCREEN --- */
            <div
              className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.3)] grid grid-cols-1 md:grid-cols-12 min-h-[580px] transition-all"
            >
              {/* Left Column: Visual/Brand Content (Desktop only) */}
              <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="NestHaven visual background" 
                    src="/auth_bg.png" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-8">
                    <img src="/logo.png" alt="PG Connect Logo" className="size-6 rounded-md object-cover shadow-xs" />
                    <span className="font-extrabold text-lg tracking-tight">PG Connect</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">Welcome Home.</h2>
                  <p className="text-xs font-medium text-slate-300 mt-2 leading-relaxed max-w-[240px]">
                    Manage your lease, payments, and community interactions in one reliable place.
                  </p>
                </div>

                <div className="relative z-10 bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-xl self-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="text-blue-400 size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">Trusted by 10k+ Residents</p>
                      <p className="text-[10px] text-slate-300 mt-1">Secure & Professional Management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Registration Form */}
              <div className="col-span-1 md:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-white dark:bg-[#131c2e]">
                {/* Mobile Branding Header */}
                <div className="flex md:hidden items-center gap-2 mb-6">
                  <img src="/logo.png" alt="PG Connect Logo" className="size-6 rounded-md object-cover shadow-xs" />
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">PG Connect</span>
                </div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join the Community</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Create your resident account to get started.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {error && (
                    <div 
                      className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold p-3 rounded-xl animate-in fade-in duration-200"
                    >
                      {error}
                    </div>
                  )}

                  {/* Visual Step Indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between relative max-w-md mx-auto">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-300 -z-10" 
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                      />
                      
                      {[1, 2, 3, 4].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (s < step) {
                              setStep(s);
                            } else if (s > step) {
                              let valid = true;
                              for (let i = step; i < s; i++) {
                                if (!validateStep(i)) {
                                  valid = false;
                                  break;
                                }
                              }
                              if (valid) setStep(s);
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                            step === s
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                              : step > s
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {step > s ? <Check className="size-3.5" /> : s}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between max-w-md mx-auto text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-2 px-1">
                      <span className={step === 1 ? "text-blue-600 dark:text-blue-400" : ""}>Account</span>
                      <span className={step === 2 ? "text-blue-600 dark:text-blue-400" : ""}>Personal</span>
                      <span className={step === 3 ? "text-blue-600 dark:text-blue-400" : ""}>Stay & ID</span>
                      <span className={step === 4 ? "text-blue-600 dark:text-blue-400" : ""}>Details</span>
                    </div>
                  </div>

                  {/* Step 1: Account Credentials */}
                  {step === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Invite Token */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="inviteToken">Invite Token</label>
                        <div className="relative flex items-center">
                          <Building2 className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="inviteToken" 
                            placeholder="e.g. INV-XXXXXX" 
                            type="text"
                            value={building}
                            onChange={(e) => setBuilding(e.target.value.toUpperCase())}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="reg-email">Email Address</label>
                        <div className="relative flex items-center">
                          <Mail className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="reg-email" 
                            placeholder="jane@example.com" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="phone">Phone Number</label>
                        <div className="relative flex items-center">
                          <Phone className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="phone" 
                            placeholder="9876543210" 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Create Password */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="reg-password">Create Password</label>
                        <div className="relative flex items-center">
                          <Lock className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-11 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="reg-password" 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                          <button 
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal mt-1">At least 8 characters with a symbol & number.</p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Details */}
                  {step === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="fullName">Full Name</label>
                        <div className="relative flex items-center">
                          <User className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="fullName" 
                            placeholder="Jane Doe" 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* DOB, Age, Blood Group grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="dob">Date of Birth</label>
                          <div className="relative flex items-center">
                            <Calendar className="size-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input 
                              className="w-full h-10 pl-10 pr-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                              id="dob" 
                              type="date"
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="age">Age</label>
                          <div className="relative flex items-center">
                            <Hash className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                            <input 
                              className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                              id="age" 
                              placeholder="24" 
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="bloodGroup">Blood Group</label>
                          <div className="relative flex items-center">
                            <Users className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                            <input 
                              className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                              id="bloodGroup" 
                              placeholder="O+ve" 
                              type="text"
                              value={bloodGroup}
                              onChange={(e) => setBloodGroup(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Father Name & Contact No */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="fatherName">Father&apos;s Name</label>
                          <div className="relative flex items-center">
                            <User className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                            <input 
                              className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                              id="fatherName" 
                              placeholder="Father's Full Name" 
                              type="text"
                              value={fatherName}
                              onChange={(e) => setFatherName(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="fatherPhone">Father&apos;s Contact No</label>
                          <div className="relative flex items-center">
                            <Phone className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                            <input 
                              className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                              id="fatherPhone" 
                              placeholder="Father's Contact No" 
                              type="tel"
                              value={fatherPhone}
                              onChange={(e) => setFatherPhone(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Identity & Stay */}
                  {step === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* ID Proof Type & Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="idProofType">ID Proof Type</label>
                          <div className="relative flex items-center">
                            <ShieldCheck className="size-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <select 
                              className="w-full h-10 pl-10 pr-10 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                              id="idProofType"
                              value={idProofType}
                              onChange={(e) => setIdProofType(e.target.value)}
                              required
                              disabled={isLoading}
                            >
                              <option value="Aadhaar">Aadhaar Card</option>
                              <option value="PAN Card">PAN Card</option>
                              <option value="Driving License">Driving License</option>
                              <option value="Passport">Passport</option>
                              <option value="Voter ID">Voter ID</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="idNumber">Aadhaar No / ID No</label>
                          <div className="relative flex items-center">
                            <Hash className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                            <input 
                              className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                              id="idNumber" 
                              placeholder="1234-5678-9012" 
                              type="text"
                              value={idNumber}
                              onChange={(e) => setIdNumber(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expected period of Stay */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="expectedStay">Expected Period of Stay</label>
                        <div className="relative flex items-center">
                          <Calendar className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="expectedStay" 
                            placeholder="e.g. 6 Months, 1 Year" 
                            type="text"
                            value={expectedStay}
                            onChange={(e) => setExpectedStay(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Occupation */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="occupation">Occupation</label>
                        <div className="relative flex items-center">
                          <Briefcase className="size-4 absolute left-3 text-slate-400 dark:text-slate-500" />
                          <input 
                            className="w-full h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                            id="occupation" 
                            placeholder="e.g. Software Engineer, Student" 
                            type="text"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Addresses, Office details & References */}
                  {step === 4 && (
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 animate-in fade-in duration-200">
                      {/* Address Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="permanentAddress">Permanent Address</label>
                          <div className="relative flex items-start">
                            <Home className="size-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                            <textarea 
                              className="w-full min-h-[70px] pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                              id="permanentAddress" 
                              placeholder="Permanent Address" 
                              value={permanentAddress}
                              onChange={(e) => setPermanentAddress(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="previousAddress">Previous Address</label>
                          <div className="relative flex items-start">
                            <Home className="size-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                            <textarea 
                              className="w-full min-h-[70px] pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                              id="previousAddress" 
                              placeholder="Previous Address" 
                              value={previousAddress}
                              onChange={(e) => setPreviousAddress(e.target.value)}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Office / College Details */}
                      <div className="border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-950/10 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Office / College Details (Optional)</h4>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400" htmlFor="officeName">Institution Name</label>
                          <input 
                            className="w-full h-8 px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            id="officeName" 
                            placeholder="e.g. Acme Corp, Christ College" 
                            type="text"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400" htmlFor="officeAddress">Institution Address</label>
                            <input 
                              className="w-full h-8 px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                              id="officeAddress" 
                              placeholder="Address details" 
                              type="text"
                              value={officeAddress}
                              onChange={(e) => setOfficeAddress(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400" htmlFor="officePhone">Institution Phone</label>
                            <input 
                              className="w-full h-8 px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                              id="officePhone" 
                              placeholder="Phone number" 
                              type="tel"
                              value={officePhone}
                              onChange={(e) => setOfficePhone(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* References details */}
                      <div className="border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-950/10 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">References (Required)</h4>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400" htmlFor="reference1">Reference (1) - Name, Address & Phone</label>
                          <textarea 
                            className="w-full min-h-[50px] px-3 py-1.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                            id="reference1" 
                            placeholder="Reference 1 Name, Address & Phone" 
                            value={reference1}
                            onChange={(e) => setReference1(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400" htmlFor="reference2">Reference (2) - Name, Address & Phone</label>
                          <textarea 
                            className="w-full min-h-[50px] px-3 py-1.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-xs text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                            id="reference2" 
                            placeholder="Reference 2 Name, Address & Phone" 
                            value={reference2}
                            onChange={(e) => setReference2(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation / Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="flex-1 h-10 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold rounded-xl active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer text-xs"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="size-4" />
                        Back
                      </button>
                    )}
                    
                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep(step)) {
                            setStep(step + 1);
                          }
                        }}
                        className="flex-1 h-10 bg-[#003d9b] hover:bg-[#0052cc] text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-slate-950 font-bold rounded-xl shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all border border-transparent disabled:opacity-50 cursor-pointer text-xs"
                        disabled={isLoading}
                      >
                        Next
                        <ArrowRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex-1 h-10 bg-[#003d9b] hover:bg-[#0052cc] text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-slate-950 font-bold rounded-xl shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all border border-transparent disabled:opacity-50 cursor-pointer text-xs"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Register
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Toggle Mode */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={toggleMode}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors ml-1"
                        disabled={isLoading}
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </form>

                {/* Footer disclaimer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 text-center">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-normal">
                    By registering, you agree to our{' '}
                    <a className="underline hover:text-slate-600 dark:hover:text-slate-300" href="#">Terms of Service</a> and{' '}
                    <a className="underline hover:text-slate-600 dark:hover:text-slate-300" href="#">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Persistent Footer copyright */}
      <div className="w-full text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 flex flex-col gap-1 mt-6 z-10">
        <p>© 2026 PG Connect. All Rights Reserved.</p>
      </div>
    </div>
  );
};
