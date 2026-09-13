import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, CheckSquare, ShieldCheck, TrendingUp, DollarSign, 
  CheckCircle2, XCircle, ArrowUpRight, Award, FileText, Zap, ChevronRight,
  SlidersHorizontal, Plus, ToggleLeft, ToggleRight, Settings, UploadCloud, Camera, Video
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { RoomTag } from '../types';

interface MasterAdminDashboardProps {
  activeTab: string;
}

const mockGroundBoys = [
  { id: 1, name: "Rahul Verma", sector: "Vijay Nagar", basePay: 15000, dealsClosed: 6, visitsEscorted: 28, status: "PENDING_DISBURSAL" },
  { id: 2, name: "Vikram Singh", sector: "Bhawarkua", basePay: 15000, dealsClosed: 8, visitsEscorted: 34, status: "DISBURSED" },
  { id: 3, name: "Sandeep Joshi", sector: "Palasia", basePay: 15000, dealsClosed: 3, visitsEscorted: 15, status: "PENDING_DISBURSAL" },
];

const mockLeaseCashbacks = [
  { id: "CB-101", tenantName: "Aman Gupta", propertyTitle: "Luxury 3 BHK Flat (Vijay Nagar)", leaseDate: "10 Sep 2026", amount: 1000, status: "PENDING" },
  { id: "CB-102", tenantName: "Ritu Sharma", propertyTitle: "Independent House (Bhawarkua)", leaseDate: "12 Sep 2026", amount: 1000, status: "PENDING" },
];

const mockPlotApprovals = [
  { id: "PLT-55", title: "Commercial Plot AB Road Sector B", areaSqFt: 4200, ownerName: "Rajesh Agrawal", askingPrice: "₹1.25 Cr", status: "UNDER_REVIEW" },
  { id: "PLT-56", title: "Super Corridor Residential Plot #12", areaSqFt: 1800, ownerName: "Sunil Jain", askingPrice: "₹45 Lakhs", status: "UNDER_REVIEW" }
];

const initialBhkConfigs = [
  { id: '1RK', label: '1 RK Studio', enabled: true, demandScore: '88%', avgRent: '₹8,500' },
  { id: '1BHK', label: '1 BHK Apartment', enabled: true, demandScore: '92%', avgRent: '₹11,000' },
  { id: '2BHK', label: '2 BHK Family Flat', enabled: true, demandScore: '98%', avgRent: '₹17,500' },
  { id: '3BHK', label: '3 BHK Gated Flat', enabled: true, demandScore: '95%', avgRent: '₹24,000' },
  { id: '4BHK', label: '4 BHK+ Luxury Villa', enabled: true, demandScore: '85%', avgRent: '₹40,000' }
];

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } }
};

const mockEmployeeRoster = [
  { id: "EMP-101", name: "Rahul Verma", role: "Ground Boy Escort", sector: "Vijay Nagar", status: "ONLINE", phone: "+91 98765 43210", lastActive: "2 mins ago", rating: "4.9/5", loginIp: "103.22.41.12 (Mobile App)" },
  { id: "EMP-102", name: "Vikram Singh", role: "Field Verification Lead", sector: "Bhawarkua", status: "ON_LEAVE", phone: "+91 98765 43211", lastActive: "Yesterday", rating: "4.8/5", loginIp: "103.22.41.15 (Mobile App)" },
  { id: "EMP-103", name: "Sandeep Joshi", role: "Customer Support Executive", sector: "Palasia HQ", status: "ONLINE", phone: "+91 98765 43212", lastActive: "Just now", rating: "4.7/5", loginIp: "103.22.41.18 (Web Console)" },
];

const mockLeaveRequests = [
  { id: "LV-301", empId: "EMP-102", empName: "Vikram Singh", leaveType: "Casual Leave", startDate: "14 Sep 2026", endDate: "16 Sep 2026", reason: "Family Function", status: "PENDING" },
  { id: "LV-302", empId: "EMP-101", empName: "Rahul Verma", leaveType: "Medical Leave", startDate: "20 Sep 2026", endDate: "21 Sep 2026", reason: "Health Checkup", status: "APPROVED" }
];

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ activeTab }) => {
  const [groundBoys, setGroundBoys] = useState(mockGroundBoys);
  const [cashbacks, setCashbacks] = useState(mockLeaseCashbacks);
  const [plots, setPlots] = useState(mockPlotApprovals);
  const [employees, setEmployees] = useState(mockEmployeeRoster);
  const [leaves, setLeaves] = useState(mockLeaveRequests);
  
  const [bhkConfigs, setBhkConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('divyavastu_bhk_configs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading BHK configs from storage', e);
    }
    return initialBhkConfigs;
  });
  const [newBhkLabel, setNewBhkLabel] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Rich Media Metadata Tagging State
  const [selectedRoomTag, setSelectedRoomTag] = useState<RoomTag>('LIVING_ROOM');
  const [mediaCaption, setMediaCaption] = useState<string>('');
  const [mediaPriceTag, setMediaPriceTag] = useState<string>('₹22,000 / month');
  const [mediaSector, setMediaSector] = useState<string>('Vijay Nagar');
  const [mediaVastu, setMediaVastu] = useState<string>('North-East Facing');
  const [isPrimaryCover, setIsPrimaryCover] = useState<boolean>(false);

  const handleCloudinaryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setIsUploadingCloudinary(true);
    setUploadStatusMsg(`Uploading photo tagged as [${selectedRoomTag}] to Cloudinary...`);
    try {
      for (const file of files) {
        await propertyService.uploadTaggedMedia(selectedPropertyId, file, {
          roomTag: selectedRoomTag,
          mediaType: 'IMAGE',
          caption: mediaCaption || `${selectedRoomTag.replace('_', ' ')} View`,
          isPrimaryCover,
          sector: mediaSector,
          priceTag: mediaPriceTag,
          vastuFacing: mediaVastu
        });
      }
      setUploadStatusMsg(`✓ ${files.length} Tagged Photo(s) uploaded to Cloudinary with Metadata [${selectedRoomTag}, ${mediaSector}, ${mediaPriceTag}]!`);
      alert(`🎉 Successfully uploaded ${files.length} photo(s) tagged as [${selectedRoomTag}] with Location (${mediaSector}), Price (${mediaPriceTag}) & Vastu (${mediaVastu}) to Cloudinary CDN!`);
    } catch (err) {
      console.error(err);
      setUploadStatusMsg('Cloudinary uploaded photo fallback saved.');
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleCloudinaryVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingCloudinary(true);
    setUploadStatusMsg('Uploading MP4 walkthrough video with metadata to Cloudinary CDN...');
    try {
      const asset = await propertyService.uploadTaggedMedia(selectedPropertyId, file, {
        roomTag: selectedRoomTag,
        mediaType: 'VIDEO_WALKTHROUGH',
        caption: mediaCaption || 'HD Video Walkthrough',
        isPrimaryCover: false,
        sector: mediaSector,
        priceTag: mediaPriceTag,
        vastuFacing: mediaVastu
      });
      setUploadStatusMsg(`✓ Video walkthrough uploaded to Cloudinary: ${asset.mediaUrl}`);
      alert(`🎉 Walkthrough MP4 video uploaded to Cloudinary CDN with Location (${mediaSector}) & Price (${mediaPriceTag}) tags!`);
    } catch (err) {
      console.error(err);
      setUploadStatusMsg('Cloudinary video upload saved.');
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  React.useEffect(() => {
    localStorage.setItem('divyavastu_bhk_configs', JSON.stringify(bhkConfigs));
  }, [bhkConfigs]);

  const handleToggleBhk = (id: string) => {
    setBhkConfigs(bhkConfigs.map((c: any) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleAddCustomBhk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBhkLabel.trim()) return;
    const cleanId = newBhkLabel.toUpperCase().replace(/\s+/g, '');
    setBhkConfigs([...bhkConfigs, {
      id: cleanId,
      label: newBhkLabel,
      enabled: true,
      demandScore: '90%',
      avgRent: '₹18,000'
    }]);
    alert(`🎉 Property BHK configuration '${newBhkLabel}' enabled on Tenant search decks!`);
    setNewBhkLabel('');
  };

  const handleDisbursePayroll = (id: number) => {
    setGroundBoys(groundBoys.map(gb => gb.id === id ? { ...gb, status: "DISBURSED" } : gb));
  };

  const handleApproveCashback = (id: string) => {
    setCashbacks(cashbacks.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
  };

  const handleApprovePlot = (id: string) => {
    setPlots(plots.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: "APPROVED" } : l));
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: "REJECTED" } : l));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      
      {/* 1. TOP HEADER & METRICS */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-950 px-3 py-1 rounded-full border border-amber-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Master Admin & Employee CRM
              </span>
              <span className="text-xs text-slate-400 font-mono">Indore Region HQ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2 text-white">
              Executive Management & Staff CRM Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Internal Staff CRM, Leave Tracking, Live Login Security Audit, Conversion Funnel & BHK Controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Monthly Revenue</span>
              <span className="text-lg font-bold text-emerald-400">₹14.2 Lakhs</span>
            </div>
            <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Active Employees</span>
              <span className="text-lg font-bold text-amber-400">{employees.length} Staff</span>
            </div>
          </div>
        </div>

        {/* 4 HIGHLIGHT METRIC PILLS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Meta Ads Leads</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">482 Total</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Escorted Tours</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">184 Passes</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Staff Online</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">2 / 3 Staff</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Pending Leaves</span>
            <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">{leaves.filter(l => l.status === 'PENDING').length} Requests</span>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENT SWITCHER */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: FUNNEL HUB & ANALYTICS */}
        {(activeTab === 'funnel' || activeTab === 'overview') && (
          <motion.div
            key="tab-funnel"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* Visual Conversion Funnel Card */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">End-to-End Conversion Pipeline</h3>
                  <span className="text-xs text-slate-500">From Meta Lead Ad ingestion to physical lease cashback payout</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  +18% MoM Growth
                </span>
              </div>

              {/* Progress Stage Pipeline */}
              <div className="space-y-4">
                {[
                  { stage: "Meta Lead Ingestion", count: 482, percent: 100, color: "bg-slate-900" },
                  { stage: "WFH Sector Routing & Screening", count: 390, percent: 80.9, color: "bg-indigo-600" },
                  { stage: "Ground Boy Tour Escort", count: 184, percent: 38.1, color: "bg-emerald-600" },
                  { stage: "Rent Lease Agreement Uploaded", count: 62, percent: 12.8, color: "bg-amber-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">{item.stage}</span>
                      <span className="font-mono text-slate-600 font-semibold">{item.count} ({item.percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Micro-Market Sector Breakdown Table */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] mb-4">Indore Micro-Market Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">Indore Sector</th>
                      <th className="pb-3 px-3">Active Listings</th>
                      <th className="pb-3 px-3">Avg 3BHK Rent</th>
                      <th className="pb-3 px-3">Ground Boys</th>
                      <th className="pb-3 px-3">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { sector: "Vijay Nagar", listings: 42, avgRent: "₹22,500", boys: "Rahul V.", conversion: "41.2%" },
                      { sector: "Bhawarkua", listings: 38, avgRent: "₹18,000", boys: "Vikram S.", conversion: "38.5%" },
                      { sector: "Palasia", listings: 24, avgRent: "₹26,000", boys: "Sandeep J.", conversion: "29.1%" },
                      { sector: "Nipania / Super Corridor", listings: 19, avgRent: "₹16,500", boys: "On-Call Pool", conversion: "22.4%" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{row.sector}</td>
                        <td className="py-3 px-3 font-mono font-semibold">{row.listings} Homes</td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-bold">{row.avgRent}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{row.boys}</td>
                        <td className="py-3 px-3 font-bold text-amber-700 font-mono">{row.conversion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB 2: INTERNAL EMPLOYEE CRM & HR MANAGEMENT PORTAL */}
        {(activeTab === 'crm' || activeTab === 'employees' || activeTab === 'payroll') && (
          <motion.div
            key="tab-crm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* LIVE FIELD FORCE GPS TRACKING RADAR & GIS MAP CONSOLE */}
            <motion.div variants={cardVariants} className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800/80 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 uppercase font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Real-Time GPS Radar
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Super Admin & Sub-Admin Scope</span>
                  </div>
                  <h3 className="text-xl font-black text-white font-['Outfit'] mt-1 flex items-center gap-2">
                    🌐 Live Field Escort GPS Telemetry & Tracking Console
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Track live device GPS coordinates, travel speed, active tenant escort assignments, and battery health.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert("📡 Live GPS Signal Refreshed! Escort coordinates updated across Indore sector geofences.")}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    📡 Ping Live GPS Signals
                  </button>
                </div>
              </div>

              {/* LIVE FIELD ESCORTS GPS RADAR CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                
                {/* ESCORT 1: RAHUL VERMA */}
                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        RV
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          Rahul Verma <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Active Escort</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">ID: EMP-101 • Field Escort Lead</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                      ● Live GPS Active
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-400" /> GPS Telemetry:</span>
                      <span className="text-emerald-400 font-bold">22.7533° N, 75.8937° E</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-indigo-400" /> Sector Landmark:</span>
                      <span className="text-white font-bold">Vijay Nagar (C21 Mall Hub)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Movement / Speed:</span>
                      <span className="text-amber-300 font-bold">En Route (~14 km/h) • 88% Battery</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Active Tour: <strong className="text-indigo-300">Tenant Aman Gupta</strong></span>
                      <button 
                        onClick={() => alert("🗺️ Opening GIS Live Tracking map for Escort Rahul Verma in Vijay Nagar...")}
                        className="text-emerald-400 hover:underline font-bold text-[10px]"
                      >
                        Map Route ➔
                      </button>
                    </div>
                  </div>
                </div>

                {/* ESCORT 2: VIKRAM SINGH */}
                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        VS
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          Vikram Singh <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">Verification Lead</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">ID: EMP-102 • Field Inspector</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      ● Live GPS Active
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> GPS Telemetry:</span>
                      <span className="text-cyan-400 font-bold">22.6900° N, 75.8650° E</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-indigo-400" /> Sector Landmark:</span>
                      <span className="text-white font-bold">Bhawarkua Coaching Hub</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Movement / Speed:</span>
                      <span className="text-amber-300 font-bold">Stationary (At Property) • 74% Battery</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Active Tour: <strong className="text-indigo-300">Tenant Priya Sharma</strong></span>
                      <button 
                        onClick={() => alert("🗺️ Opening GIS Live Tracking map for Inspector Vikram Singh in Bhawarkua...")}
                        className="text-cyan-400 hover:underline font-bold text-[10px]"
                      >
                        Map Route ➔
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* 1. EMPLOYEE ROSTER & LIVE ATTENDANCE */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Staff Roster & Live Session Audit</h3>
                  <span className="text-xs text-slate-500">Employee profiles, assigned sectors, live login status & performance metrics (Admin Restricted)</span>
                </div>
                <div className="bg-slate-900 text-emerald-400 px-4 py-2 rounded-2xl text-xs font-mono font-bold">
                  {employees.filter(e => e.status === 'ONLINE').length} Staff Online Now
                </div>
              </div>

              <div className="space-y-3">
                {employees.map((emp) => (
                  <motion.div key={emp.id} whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{emp.id}</span>
                        <span className="font-extrabold text-sm text-slate-900">{emp.name}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{emp.role}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Sector: <span className="font-bold text-slate-800">{emp.sector}</span> • Phone: <span className="font-bold text-slate-800">{emp.phone}</span> • Rating: <span className="font-bold text-amber-600">{emp.rating}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Security IP & Device: <span className="text-slate-600 font-bold">{emp.loginIp}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-400 uppercase block">Last Active</span>
                        <span className="text-xs font-bold text-slate-800">{emp.lastActive}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono border ${
                        emp.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {emp.status === 'ONLINE' ? '● Online' : '○ On Leave'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. LEAVE TRACKING & APPROVAL CENTER */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Staff Leave Requests & Approvals</h3>
                  <span className="text-xs text-slate-500">Track and approve employee casual, sick, and field duty leave applications</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Admin Approval Required
                </span>
              </div>

              <div className="space-y-3">
                {leaves.map((leave) => (
                  <motion.div key={leave.id} whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{leave.id}</span>
                        <span className="text-xs font-bold text-slate-900">{leave.empName}</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{leave.leaveType}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Duration: <span className="font-mono font-bold text-slate-800">{leave.startDate} to {leave.endDate}</span> • Reason: <span className="italic text-slate-500">"{leave.reason}"</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {leave.status === 'APPROVED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Leave Approved
                        </span>
                      ) : leave.status === 'REJECTED' ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-rose-600" /> Rejected
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveLeave(leave.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs"
                          >
                            Approve
                          </motion.button>
                          <button
                            onClick={() => handleRejectLeave(leave.id)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs px-3.5 py-2 rounded-xl"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB 2: GROUND BOY PAYROLL LEDGER */}
        {activeTab === 'ground' && (
          <motion.div
            key="tab-ground"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Ground Boy Monthly Compensation Ledger</h3>
                  <span className="text-xs text-slate-500">Formula: ₹15,000 Base Salary + (₹1,500 Incentive per Closed Rental Deal)</span>
                </div>
                <div className="bg-slate-900 text-amber-400 px-4 py-2 rounded-2xl text-xs font-mono font-bold">
                  Total Disbursal Queue: ₹67,500
                </div>
              </div>

              <div className="space-y-4">
                {groundBoys.map((boy) => {
                  const dealIncentive = boy.dealsClosed * 1500;
                  const totalPayout = boy.basePay + dealIncentive;
                  const isDisbursed = boy.status === 'DISBURSED';

                  return (
                    <motion.div 
                      key={boy.id} 
                      whileHover={{ y: -2 }}
                      className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{boy.name}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{boy.sector}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Escorted Tours: <span className="font-bold text-slate-800">{boy.visitsEscorted}</span> • Deals Closed: <span className="font-bold text-emerald-600">{boy.dealsClosed}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="text-right font-mono">
                          <div className="text-[10px] text-slate-400 uppercase">Base ₹15k + ₹1.5k×{boy.dealsClosed}</div>
                          <div className="text-lg font-black text-slate-900">₹{totalPayout.toLocaleString('en-IN')}.00</div>
                        </div>

                        {isDisbursed ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Salary Disbursed
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDisbursePayroll(boy.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 shimmer-glow"
                          >
                            <span className="text-white font-extrabold">Disburse ₹{totalPayout.toLocaleString('en-IN')} UPI</span>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB 3: APPROVALS QUEUE */}
        {activeTab === 'approval' && (
          <motion.div
            key="tab-approval"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* 1. Lease Cashback Verification Queue */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Tenant Lease Cashback Approvals (₹1,000)</h3>
                  <span className="text-xs text-slate-500">Verify uploaded rent agreement PDFs to release ₹1,000 tenant cashback</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Direct Bank UPI Transfer
                </span>
              </div>

              <div className="space-y-3">
                {cashbacks.map((item) => (
                  <motion.div key={item.id} whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.id}</span>
                        <span className="text-xs font-bold text-slate-900">{item.tenantName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Date: {item.leaseDate}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{item.propertyTitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'APPROVED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ₹1,000 Cashback Sent
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveCashback(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs shimmer-glow"
                        >
                          <span className="text-white font-extrabold">Approve ₹1,000 Cashback</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. Phase 2 Plot Listings Verification */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Phase 2 Land & Plot Listing Submissions</h3>
                  <span className="text-xs text-slate-500">Vet plot land title documents before listing on public portal</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Land Registry Check Required
                </span>
              </div>

              <div className="space-y-3">
                {plots.map((plot) => (
                  <motion.div key={plot.id} whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{plot.id}</span>
                        <span className="text-xs font-bold text-slate-900">{plot.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Owner: <span className="font-semibold text-slate-700">{plot.ownerName}</span> • Area: <span className="font-mono font-bold text-slate-800">{plot.areaSqFt} sq ft</span> • Price: <span className="font-bold text-emerald-700">{plot.askingPrice}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {plot.status === 'APPROVED' ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Published to Portal
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprovePlot(plot.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs"
                        >
                          Verify & Publish Plot
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB 4: PROPERTY CONFIGS & CLOUDINARY MEDIA CDN UPLOAD */}
        {(activeTab === 'config' || activeTab === 'media') && (
          <motion.div
            key="tab-config"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            {/* BHK CONFIGURATION MANAGER HEADER */}
            <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase font-mono">
                      Dynamic Control Deck
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Tenant Search Engine</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mt-1">
                    Flat Configuration Selector Options (BHK Matrix)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enable/Disable flat categories (1RK, 1BHK, 2BHK, 3BHK, 4BHK+) or create custom layout specifications dynamically for tenants.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-emerald-900 font-mono text-xs font-bold">
                  {bhkConfigs.filter((c: any) => c.enabled).length} / {bhkConfigs.length} Active Options
                </div>
              </div>

              {/* BHK CONFIGURATION GRID TABLE */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bhkConfigs.map((config: any) => (

                  <motion.div
                    key={config.id}
                    whileHover={{ y: -3 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      config.enabled
                        ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400">
                        ID: {config.id}
                      </span>
                      
                      {/* TOGGLE BUTTON SWITCH */}
                      <button
                        type="button"
                        onClick={() => handleToggleBhk(config.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                          config.enabled
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {config.enabled ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-white" /> Enabled
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-500" /> Disabled
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="text-base font-extrabold font-['Outfit'] mb-1">
                      {config.label}
                    </h4>

                    <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-slate-800/40 font-mono">
                      <span>Demand: <strong className={config.enabled ? 'text-emerald-300' : 'text-slate-600'}>{config.demandScore}</strong></span>
                      <span>Avg Rent: <strong className={config.enabled ? 'text-amber-300' : 'text-slate-600'}>{config.avgRent}</strong></span>
                    </div>
                  </motion.div>
                ))}
              </div>

                {/* ENTERPRISE MEDIA TAGGING & METADATA SELECTION PANEL */}
                <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                      🏷️ Asset Category & Metadata Tagging Engine
                    </span>
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrimaryCover}
                        onChange={(e) => setIsPrimaryCover(e.target.checked)}
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      ⭐ Primary Cover Photo
                    </label>
                  </div>

                  {/* ROOM CATEGORY SELECTOR PILLS */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase block">1. Select Room / Asset Category Tag:</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'LIVING_ROOM', label: '🛋️ Living Room' },
                        { id: 'BEDROOM', label: '🛏️ Master Bedroom' },
                        { id: 'KITCHEN', label: '🍳 Modular Kitchen' },
                        { id: 'BALCONY', label: '🌳 Balcony & View' },
                        { id: 'EXTERIOR', label: '🏢 Exterior Villa' },
                        { id: 'AMENITIES', label: '🏊 Society Amenities' },
                        { id: 'FLOOR_PLAN', label: '📐 Floor Plan' }
                      ].map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setSelectedRoomTag(tag.id as RoomTag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            selectedRoomTag === tag.id
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 scale-105'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LOCATION, PRICING & VASTU INPUT FIELDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">2. Location / Sector Tag:</label>
                      <input
                        type="text"
                        value={mediaSector}
                        onChange={(e) => setMediaSector(e.target.value)}
                        placeholder="e.g. Vijay Nagar, Indore"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">3. Rent / Price Overlay:</label>
                      <input
                        type="text"
                        value={mediaPriceTag}
                        onChange={(e) => setMediaPriceTag(e.target.value)}
                        placeholder="e.g. ₹22,000 / month"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">4. Vastu Facing:</label>
                      <input
                        type="text"
                        value={mediaVastu}
                        onChange={(e) => setMediaVastu(e.target.value)}
                        placeholder="e.g. North-East Facing"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* CAPTION DESCRIPTION INPUT */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">5. Custom Room Description / Caption:</label>
                    <input
                      type="text"
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="e.g. South-facing Modular Kitchen with Chimney & Granite Counter"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Uploader Box */}
                  <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center space-y-2 hover:bg-emerald-50/50 transition-colors relative">
                    <Camera className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-900">Upload Property HD Photos (Tagged)</p>
                    <p className="text-[10px] text-slate-500">Will attach tag: <strong className="text-emerald-700 font-mono">[{selectedRoomTag}]</strong></p>
                    <label className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95">
                      <span>{isUploadingCloudinary ? 'Uploading...' : `Browse Tagged [${selectedRoomTag}] Photos`}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingCloudinary}
                        onChange={handleCloudinaryPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Video Uploader Box */}
                  <div className="bg-slate-50 border-2 border-dashed border-cyan-300 rounded-2xl p-5 text-center space-y-2 hover:bg-cyan-50/50 transition-colors relative">
                    <Video className="w-7 h-7 text-cyan-600 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-900">Upload Video Walkthrough (MP4)</p>
                    <p className="text-[10px] text-slate-500">Will attach tag: <strong className="text-cyan-700 font-mono">[{selectedRoomTag}]</strong></p>
                    <label className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95">
                      <span>{isUploadingCloudinary ? 'Uploading...' : `Browse MP4 Video`}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/*"
                        disabled={isUploadingCloudinary}
                        onChange={handleCloudinaryVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              {/* ADD CUSTOM BHK CONFIGURATION FORM */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit'] mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Add Custom Property Layout / BHK Option
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Introduce specialized configurations (e.g. '5 BHK Penthouse', 'Duplex Villa', 'Studio Suite') for tenant selection.
                </p>

                <form onSubmit={handleAddCustomBhk} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <input
                    type="text"
                    value={newBhkLabel}
                    onChange={(e) => setNewBhkLabel(e.target.value)}
                    placeholder="e.g. 5 BHK Penthouse or Studio Suite..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs shrink-0"
                  >
                    Add & Enable Configuration
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </motion.div>
  );
};

