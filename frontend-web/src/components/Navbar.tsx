import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, UserProfile } from '../types';
import { 
  Building2, Sparkles, Gift, User, LogOut, Bookmark, Calendar, 
  MessageSquare, Users, AlertCircle, BarChart3, ShieldCheck, CheckSquare, ChevronDown, SlidersHorizontal, UploadCloud
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  role: UserRole;
  onOpenAuthModal: () => void;
  onOpenLeaseUpload: () => void;
  onLogout: () => void;
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  role,
  onOpenAuthModal,
  onOpenLeaseUpload,
  onLogout,
  activeAdminTab = 'overview',
  setActiveAdminTab
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const visitsUsed = user?.freeVisitsUsed || 0;
  const isPaywallActive = visitsUsed >= 5;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/85 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 transition-all duration-300 shadow-sm/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* BRANDING & GUEST LINKS */}
        {(role === 'GUEST' || role === 'TENANT') && (
          <div className="flex items-center gap-4 sm:gap-8">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0"
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <div>
                <a href="#" className="font-['Outfit',sans-serif] text-base sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  Divyavastu <span className="text-emerald-600">Spaces</span>
                </a>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Indore (HQ)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 hidden md:inline">
                    + Multi-City Expansion Active
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Guest Nav Links (ONLY for GUEST) */}
            {role === 'GUEST' && (
              <nav className="hidden md:flex items-center gap-6">
                <a 
                  href="#listings" 
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 relative py-1 transition-colors"
                >
                  Verified Rentals
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 relative py-1 transition-colors"
                >
                  How It Works
                </a>
                <a 
                  href="#why-us" 
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-600 relative py-1 transition-colors"
                >
                  Why Divyavastu
                </a>
                <a 
                  href="#land-plots"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 relative py-1 transition-colors"
                >
                  <span>Plot & Land</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Phase 2
                  </span>
                </a>
              </nav>
            )}
          </div>
        )}

        {role === 'EMPLOYEE' && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Outfit',sans-serif] text-base font-bold text-slate-900">
                Divyavastu Spaces
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md ml-2 border border-indigo-200">
                Staff CRM Workspace
              </span>
            </div>
          </motion.div>
        )}

        {role === 'SUB_ADMIN' && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Outfit',sans-serif] text-base font-bold text-slate-900">
                Divyavastu Admin
              </span>
              <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md ml-2 border border-purple-200">
                Sub-Admin (Limited Access)
              </span>
            </div>
          </motion.div>
        )}

        {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Outfit',sans-serif] text-base font-bold text-slate-900">
                Divyavastu Console
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md ml-2 border border-amber-200">
                Super Admin (Full Master)
              </span>
            </div>
          </motion.div>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {role === 'GUEST' && (
            <>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#f1f5f9' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert("Landlord Portal: List your Indore rental zero-commission!")}
                className="hidden lg:block text-xs font-semibold text-slate-600 px-3 py-2 rounded-xl transition-colors"
              >
                List Property (Landlords)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={onOpenAuthModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </motion.button>
            </>
          )}

          {role === 'TENANT' && (
            <>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!isPaywallActive ? (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-slate-500 font-medium hidden xs:inline">Free Passes:</span>
                    <span className="font-bold text-slate-900">{visitsUsed} / 5</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs shadow-xs">
                    <span className="text-amber-800 font-medium hidden xs:inline">Wallet:</span>
                    <span className="font-bold text-amber-900">₹{user?.walletBalance || 0}</span>
                  </div>
                )}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={onOpenLeaseUpload}
                className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all items-center gap-1.5 shadow-sm"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Claim ₹1,000 Cash-Back</span>
              </motion.button>
            </>
          )}

          {(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-[calc(100vw-3rem)] sm:max-w-none">
              {[
                { id: 'funnel', label: 'Funnel Hub', icon: BarChart3 },
                { id: 'crm', label: 'Staff CRM & Attendance', icon: Users },
                { id: 'approval', label: 'Approvals Queue', icon: CheckSquare },
                { id: 'config', label: 'BHK Engine', icon: SlidersHorizontal },
                { id: 'media', label: 'Cloudinary Media CDN', icon: UploadCloud }
              ].map(tab => {
                const isActive = activeAdminTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveAdminTab && setActiveAdminTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 z-10 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="masterAdminTabIndicator"
                        className="absolute inset-0 bg-slate-900 rounded-lg shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* UNIVERSAL LOGGED-IN PROFILE & LOGOUT DROPDOWN HUB */}
          {role !== 'GUEST' && (
            <div 
              className="relative py-1"
              onMouseEnter={() => setProfileDropdownOpen(true)}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors border border-slate-800 shadow-sm"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  role === 'SUPER_ADMIN' || role === 'ADMIN' ? 'bg-amber-500 text-slate-950' :
                  role === 'SUB_ADMIN' ? 'bg-purple-500 text-white' :
                  role === 'EMPLOYEE' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : role.charAt(0)}
                </div>
                <span className="text-xs font-semibold max-w-[110px] truncate hidden sm:inline text-slate-200">
                  {user?.fullName || role}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="absolute right-0 mt-1 w-56 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50">
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="truncate max-w-[130px]">{user?.fullName || 'User'}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          role === 'SUPER_ADMIN' || role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          role === 'SUB_ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          role === 'EMPLOYEE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {role}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'user@divyavastu.in'}</p>
                    </div>

                    {role === 'TENANT' && (
                      <div className="p-1 border-b border-slate-800/80">
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); alert("Navigating to My Bookings"); }}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> My Bookings
                        </button>
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); alert("Navigating to Saved Homes"); }}
                          className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-emerald-400 flex items-center gap-2.5 transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" /> Saved Homes
                        </button>
                      </div>
                    )}

                    <div className="p-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                        className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" /> Log Out Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </motion.header>
  );
};

