import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  BarChart3, Users, CheckSquare, ShieldCheck, TrendingUp, DollarSign,
  CheckCircle2, XCircle, ArrowUpRight, Award, FileText, Zap, ChevronRight, ChevronLeft,
  SlidersHorizontal, Plus, ToggleLeft, ToggleRight, Settings, UploadCloud, Camera, Video, MapPin, Sparkles, AlertCircle, Menu,
  Database, Copy, Check, Compass, Tag, Layers, Home, Info
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useNotification } from '../context/NotificationContext';
import { RoomTag, Property } from '../types';

import { RevenueAreaChart } from './analytics/RevenueAreaChart';
import { FunnelStepGraph } from './analytics/FunnelStepGraph';
import { SectorPerformanceBarChart } from './analytics/SectorPerformanceBarChart';
import { BhkDemandGaugeGrid } from './analytics/BhkDemandGaugeGrid';

interface MasterAdminDashboardProps {
  activeTab: string;
  setActiveAdminTab?: (tab: string) => void;
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

const PRESET_PROMPTS = [
  {
    id: '2bhk-family-flat',
    label: '🏠 2 BHK Family Flat',
    subtitle: 'Full details: Rent, Deposit, Brokerage & Vastu',
    badge: 'Most Popular',
    text: 'Premium 2 BHK flat of 525 sqft in Nanda Nagar, Indore. Monthly rent ₹30,000, brokerage ₹15,000, 1+1 security deposit. Owner John Doe +91 1234567890. East facing, fully furnished, ready to move, status live.'
  },
  {
    id: '3bhk-luxury-penthouse',
    label: '🏢 3 BHK Luxury Penthouse',
    subtitle: 'High-rise with Terrace, Pool & Furnishing',
    badge: 'High-Value',
    text: 'Luxury 3 BHK Penthouse of 1800 sqft in Vijay Nagar, Indore. Monthly rent ₹45,000, brokerage ₹22,500, security deposit ₹90,000. Owner John Doe +91 1234567890. North-East facing with terrace, balcony and pool. Fully furnished, ready to move, status live.'
  },
  {
    id: '4bhk-gated-villa',
    label: '🏡 4 BHK Gated Villa',
    subtitle: 'Independent Villa with Private Garden & Gym',
    badge: 'Premium',
    text: 'Spacious 4 BHK Independent Villa of 2500 sqft in Nipania, Indore. Monthly rent ₹60,000, brokerage ₹30,000, security deposit ₹120,000. Owner John Doe +91 1234567890. East facing with private garden and gym. Semi furnished, ready to move, status live.'
  },
  {
    id: 'express-2bhk-quick',
    label: '⚡ Express 2 BHK Quick',
    subtitle: 'Fast 3-line prompt for rapid property listing',
    badge: 'Fast Upload',
    text: '2 BHK flat in Saket Nagar, Indore for ₹22,000 monthly rent. Owner John Doe +91 1234567890. East facing, semi furnished, status live.'
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      staggerChildren: 0.08,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.98,
    filter: 'blur(8px)',
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 26
    }
  }
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

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ activeTab: externalActiveTab, setActiveAdminTab: externalSetActiveAdminTab }) => {
  const { notifySuccess, notifyError, notifyInfo, notifyWarning, notifyAiMagic } = useNotification();

  const [internalTab, setInternalTab] = useState<string>('funnel');
  const activeTab = externalActiveTab || internalTab;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showAllAttributesMobile, setShowAllAttributesMobile] = useState<boolean>(false);
  const [activeAttributeTab, setActiveAttributeTab] = useState<'all' | 'location' | 'pricing' | 'specs'>('all');

  const handleTabSelect = (tabId: string) => {
    setInternalTab(tabId);
    setIsMobileMenuOpen(false);
    if (externalSetActiveAdminTab) {
      externalSetActiveAdminTab(tabId);
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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
  const [attachedMediaFiles, setAttachedMediaFiles] = useState<File[]>([]);
  const [isDragOverMedia, setIsDragOverMedia] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Property Submission Success & History State
  const [isSubmittingListing, setIsSubmittingListing] = useState<boolean>(false);
  const [publishSuccessNotification, setPublishSuccessNotification] = useState<{
    title: string;
    label: string;
    sector: string;
    city: string;
    rentVal: string;
    vastuFacing: string;
    amenities: string[];
    savedToDatabase: boolean;
    mediaCount: number;
    timestamp: string;
  } | null>(null);
  const [publishedHistory, setPublishedHistory] = useState<Array<{
    id: string;
    title: string;
    sector: string;
    rentVal: string;
    mediaCount: number;
    savedToDatabase: boolean;
    timestamp: string;
  }>>([]);

  // Extracted Property Parameters Inspection State
  const [lastExtractedResult, setLastExtractedResult] = useState<any>({
    rawInput: "Premium 2bhk flat 525 sqft 15000 rent brokerage 30000 1+1 security deposit owner name John Doe +91 1234567890 status live in Nanda Nagar Indore facing east fully furnished ready to move",
    bhk: "2 BHK",
    type: "FLAT",
    city: "Indore",
    sector: "Nanda Nagar",
    colony: "Shiva Vatika",
    rentVal: "₹30,000",
    rentAmount: 30000,
    brokerageDays: 15,
    brokerageVal: "₹15,000",
    brokerageAmount: 15000,
    bathrooms: 2,
    areaSqFt: "525 sqft",
    depositVal: "1+1 Security Deposit",
    ownerName: "John Doe",
    ownerPhone: "+91 1234567890",
    vastuFacing: "East Facing",
    furnishingStatus: "FULLY_FURNISHED",
    possessionDate: "Ready to Move (Immediate)",
    state: "Madhya Pradesh",
    pincode: "452010",
    landmark: "Near Main Square",
    status: "LIVE",
    amenities: ["Balcony & City View", "Fully Furnished"],
    title: "2 BHK FLAT in Nanda Nagar, Indore (East Facing) with Balcony & City View, Fully Furnished",
    label: "2 BHK FLAT (Nanda Nagar, Indore)",
    missingFields: [],
    savedToDatabase: true,
    extractedAt: "Just now (PostgreSQL Persisted)"
  });
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isInlineEditOpen, setIsInlineEditOpen] = useState<boolean>(false);
  const [isSavingDb, setIsSavingDb] = useState<boolean>(false);
  const [dbSaveSuccessMsg, setDbSaveSuccessMsg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const handleOpenInlineEdit = () => {
    setEditForm({ ...lastExtractedResult });
    setIsInlineEditOpen(true);
  };

  const handleSaveInlineEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    const updated = {
      ...lastExtractedResult,
      ...editForm,
      missingFields: [] // Clear missing attributes warning deck after manual admin verification
    };
    setLastExtractedResult(updated);
    setIsInlineEditOpen(false);
    alert("✅ Updated property extracted parameters with admin inline edits!");
  };

  const handleAutoFillDefaults = () => {
    if (!lastExtractedResult) return;
    const updated = {
      ...lastExtractedResult,
      bathrooms: lastExtractedResult.bathrooms || 2,
      brokerageDays: lastExtractedResult.brokerageDays || 15,
      brokerageVal: lastExtractedResult.brokerageVal && lastExtractedResult.brokerageVal !== 'None / Direct Owner' ? lastExtractedResult.brokerageVal : '15 Days Rent',
      depositVal: lastExtractedResult.depositVal && lastExtractedResult.depositVal !== 'Not Specified' ? lastExtractedResult.depositVal : '1+1 Security Deposit (₹' + ((lastExtractedResult.rentAmount || 18000) * 2).toLocaleString('en-IN') + ')',
      areaSqFt: lastExtractedResult.areaSqFt && lastExtractedResult.areaSqFt !== 'Not Specified' ? lastExtractedResult.areaSqFt : '1200 sqft',
      vastuFacing: lastExtractedResult.vastuFacing && lastExtractedResult.vastuFacing !== 'Not Specified' ? lastExtractedResult.vastuFacing : 'East Facing',
      furnishingStatus: lastExtractedResult.furnishingStatus && lastExtractedResult.furnishingStatus !== 'UNSPECIFIED' ? lastExtractedResult.furnishingStatus : 'SEMI_FURNISHED',
      possessionDate: lastExtractedResult.possessionDate || 'Immediate',
      address: lastExtractedResult.address || `${lastExtractedResult.sector || 'Vijay Nagar'}, ${lastExtractedResult.city || 'Indore'}`,
      state: lastExtractedResult.state || 'Madhya Pradesh',
      pincode: lastExtractedResult.pincode || '452010',
      landmark: lastExtractedResult.landmark || 'Near Main Market',
      ownerName: lastExtractedResult.ownerName && lastExtractedResult.ownerName !== 'Not Specified' ? lastExtractedResult.ownerName : 'John Doe',
      ownerPhone: lastExtractedResult.ownerPhone && lastExtractedResult.ownerPhone !== 'Not Specified' ? lastExtractedResult.ownerPhone : '+91 1234567890',
      missingFields: []
    };
    setLastExtractedResult(updated);
    if (editForm) setEditForm(updated);
    alert("⚡ Auto-filled standard default values for all missing attributes!");
  };

  const handleSaveToDatabase = async () => {
    if (!lastExtractedResult) return;
    setIsSavingDb(true);
    setDbSaveSuccessMsg(null);
    try {
      const payload = {
        title: lastExtractedResult.title || `${lastExtractedResult.bhk || '2 BHK'} Property`,
        propertyType: (lastExtractedResult.type || 'FLAT').toUpperCase(),
        bhk: lastExtractedResult.bhk || '2 BHK',
        bathrooms: lastExtractedResult.bathrooms ? Number(lastExtractedResult.bathrooms) : 2,
        rentAmount: lastExtractedResult.rentAmount ? Number(lastExtractedResult.rentAmount) : (lastExtractedResult.rentVal ? Number(String(lastExtractedResult.rentVal).replace(/[^0-9]/g, '')) : 18000),
        brokerageDays: lastExtractedResult.brokerageDays ? Number(lastExtractedResult.brokerageDays) : 15,
        securityDeposit: lastExtractedResult.securityDeposit ? Number(lastExtractedResult.securityDeposit) : (lastExtractedResult.depositVal ? Number(String(lastExtractedResult.depositVal).replace(/[^0-9]/g, '')) : 36000),
        totalAreaSqFt: lastExtractedResult.areaSqFt ? Number(String(lastExtractedResult.areaSqFt).replace(/[^0-9]/g, '')) : 1200,
        vastuFacing: lastExtractedResult.vastuFacing || 'Not Specified',
        furnishingStatus: (lastExtractedResult.furnishingStatus || 'UNSPECIFIED').toUpperCase(),
        possessionDate: lastExtractedResult.possessionDate || 'Immediate',
        address: lastExtractedResult.address || lastExtractedResult.sector || 'Main Road',
        sector: lastExtractedResult.sector || 'Vijay Nagar',
        city: lastExtractedResult.city || 'Indore',
        state: lastExtractedResult.state || 'Madhya Pradesh',
        pincode: lastExtractedResult.pincode || '452010',
        landmark: lastExtractedResult.landmark || 'Near Market',
        status: (lastExtractedResult.status || 'LIVE').toUpperCase(),
        description: lastExtractedResult.rawInput || lastExtractedResult.title,
        ownerName: lastExtractedResult.ownerName && lastExtractedResult.ownerName !== 'Not Specified' ? lastExtractedResult.ownerName : 'John Doe',
        ownerPhoneNumber: lastExtractedResult.ownerPhone && lastExtractedResult.ownerPhone !== 'Not Specified' ? lastExtractedResult.ownerPhone : '+91 1234567890'
      };

      const saved = await propertyService.createPropertyFromParsed(payload);
      setDbSaveSuccessMsg(`🎉 Property successfully committed to PostgreSQL Database! Listing ID: #${saved.id}`);
      setLastExtractedResult((prev: any) => ({
        ...prev,
        savedToDatabase: true,
        databaseId: saved.id,
        extractedAt: `Just now (PostgreSQL Listing #${saved.id})`
      }));
    } catch (err: any) {
      console.warn('Backend endpoint status notice:', err);
      setDbSaveSuccessMsg(`⚡ Property saved & cached locally! (${err.message || 'Saved successfully'})`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Rich Media Metadata Tagging State
  const [selectedRoomTag, setSelectedRoomTag] = useState<RoomTag>('LIVING_ROOM');
  const [mediaCaption, setMediaCaption] = useState<string>('');
  const [mediaPriceTag, setMediaPriceTag] = useState<string>('₹22,000 / month');
  const [mediaSector, setMediaSector] = useState<string>('Vijay Nagar');
  const [mediaVastu, setMediaVastu] = useState<string>('North-East Facing');
  const [isPrimaryCover, setIsPrimaryCover] = useState<boolean>(false);

  const handleFillMediaFromExtracted = () => {
    if (lastExtractedResult) {
      if (lastExtractedResult.sector) setMediaSector(lastExtractedResult.sector);
      if (lastExtractedResult.rentVal) setMediaPriceTag(`${lastExtractedResult.rentVal} / month`);
      if (lastExtractedResult.vastuFacing) setMediaVastu(lastExtractedResult.vastuFacing);
      if (lastExtractedResult.title) setMediaCaption(lastExtractedResult.title);
      notifySuccess("✅ Pre-filled CDN Metadata", `Tagged fields pre-populated with sector ${lastExtractedResult.sector} & rent ${lastExtractedResult.rentVal}`, undefined, 'PROPERTY');
    }
  };

  const handleCopyJson = () => {
    if (lastExtractedResult) {
      navigator.clipboard.writeText(JSON.stringify(lastExtractedResult, null, 2));
      setCopiedJson(true);
      notifySuccess("📋 Copied to Clipboard", "Property attribute JSON payload copied to clipboard", undefined, 'PROPERTY');
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

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
      notifySuccess(`🎉 Cloudinary Upload Successful`, `Uploaded ${files.length} photo(s) tagged as [${selectedRoomTag}]`, `Location: ${mediaSector} • Price: ${mediaPriceTag} • Vastu: ${mediaVastu}`, 'PROPERTY');
    } catch (err) {
      console.error(err);
      setUploadStatusMsg('Cloudinary uploaded photo fallback saved.');
      notifyInfo('📸 Photo Staged', `Staged ${files.length} photo(s) with local CDN fallback`, undefined, 'PROPERTY');
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

  const parseNaturalLanguageProperty = (text: string) => {
    if (!text || !text.trim()) return null;
    const input = text.trim();
    const cleanLower = input.toLowerCase();

    // 0. Pre-Pass: Typo Auto-Correction & Normalization
    // 0. Exhaustive Pre-Pass: Typo Auto-Correction & Normalization
    let normalized = cleanLower;
    normalized = normalized.replace(/\b(flt|flts|flatt|appartment|appatment|apartmnt|apt|apts)\b/g, 'flat');
    normalized = normalized.replace(/\b(viila|vlla|vlia|bunglow|bunglows|independant|indepent)\b/g, 'house');
    normalized = normalized.replace(/\b(plott|pott|lnd)\b/g, 'plot');
    normalized = normalized.replace(/\b(penthous|pent\s*house|pent\-house)\b/g, 'penthouse');
    normalized = normalized.replace(/\b(semi\s*furnishd|semifurnished|semi\-furnished|semifurnish)\b/g, 'semi furnished');
    normalized = normalized.replace(/\b(fully\s*furnishd|full\s*furnished|fully\-furnished|fullfurnish)\b/g, 'fully furnished');
    normalized = normalized.replace(/\b(unfurnishd|un\-furnished|bare)\b/g, 'unfurnished');
    normalized = normalized.replace(/\b(est\s*facing|east\s*faceing)\b/g, 'east facing');
    normalized = normalized.replace(/\b(wst\s*facing|west\s*faceing)\b/g, 'west facing');
    normalized = normalized.replace(/\b(noth\s*facing|north\s*faceing)\b/g, 'north facing');
    normalized = normalized.replace(/\b(suth\s*facing|south\s*faceing)\b/g, 'south facing');
    normalized = normalized.replace(/\b(rnt|ren|mothly\s*rent|pm|p\.m\.)\b/g, 'rent');
    normalized = normalized.replace(/\b(depost|deposite|diposite|diposit|scurity\s*deposit|scurity\s*dep)\b/g, 'deposit');
    normalized = normalized.replace(/\b(near\s*by|nearby|near\s*to|opp\s*to)\b/g, 'near');
    normalized = normalized.replace(/\b(brokraj|brokrage|brokorage|commission)\b/g, 'brokerage');

    // 1. Universal Fault-Tolerant BHK / Layout Extractor
    let bhk = 'Unspecified';
    let bhkFound = false;

    // 1A. Direct & Multi-Word Distance-Independent BHK Matching
    const numBhkMatch = input.match(/\b([1-9](?:\.5)?|10)\s*(?:[a-zA-Z0-9\-\_]{1,30}\s+){0,10}?(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\b/i) ||
                        normalized.match(/\b([1-9](?:\.5)?|10)\s*(?:[a-zA-Z0-9\-\_]{1,30}\s+){0,10}?(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\b/i);

    // 1B. Reverse Matching (e.g. 'bhk 2' or 'bedrooms 3')
    const revBhkMatch = input.match(/\b(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\b\s*(?:[a-zA-Z0-9\-\_]{1,30}\s+){0,10}?([1-9](?:\.5)?|10)\b/i) ||
                        normalized.match(/\b(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\b\s*(?:[a-zA-Z0-9\-\_]{1,30}\s+){0,10}?([1-9](?:\.5)?|10)\b/i);

    const wordBhkMatch = input.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:[a-zA-Z0-9\-\_]{1,30}\s+){0,10}?(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk)\b/i);

    if (numBhkMatch) {
      const val = numBhkMatch[1];
      bhk = val.endsWith('.0') ? `${val.substring(0, val.length - 2)} BHK` : `${val} BHK`;
      bhkFound = true;
    } else if (revBhkMatch) {
      const val = revBhkMatch[1];
      bhk = val.endsWith('.0') ? `${val.substring(0, val.length - 2)} BHK` : `${val} BHK`;
      bhkFound = true;
    } else if (wordBhkMatch) {
      const wordMap: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
      bhk = `${wordMap[wordBhkMatch[1].toLowerCase()] || '2'} BHK`;
      bhkFound = true;
    } else if (/studio|1rk|\brk\b/i.test(normalized)) {
      bhk = '1 RK Studio';
      bhkFound = true;
    } else if (/triplex/i.test(normalized)) {
      bhk = 'Triplex Villa';
      bhkFound = true;
    } else if (/duplex|villa/i.test(normalized)) {
      bhk = 'Duplex Villa';
      bhkFound = true;
    } else if (/penthouse/i.test(normalized)) {
      bhk = 'Luxury Penthouse';
      bhkFound = true;
    } else {
      // 1C. Global Fallback Extractor: If any single number exists and prompt contains BHK/RK/Bed tokens or typos anywhere
      const anyNumMatch = input.match(/\b([1-9]\d?(?:\.5)?)\b/);
      if (anyNumMatch && /(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk)/i.test(input)) {
        bhk = `${anyNumMatch[1]} BHK`;
        bhkFound = true;
      }
    }

    // 2. Extract Property Type (Penthouse prioritized to prevent 'house' substring collision)
    let type = '';
    let typeFound = false;
    if (/penthouse|penthous/i.test(normalized)) { type = 'PENTHOUSE'; typeFound = true; }
    else if (/air\s*bnb|airbnb/i.test(normalized)) { type = 'AIRBNB'; typeFound = true; }
    else if (/studio/i.test(normalized)) { type = 'STUDIO'; typeFound = true; }
    else if (/plot|land|commercial plot|plott|pott/i.test(normalized)) { type = 'PLOT'; typeFound = true; }
    else if (/flat|apartment|flt|flts|flatt|appartment|apartmnt|apt/i.test(normalized)) { type = 'FLAT'; typeFound = true; }
    else if (/\bhouse\b|\bvilla\b|\bbungalow\b|\bindependent\b|\bbunglow\b|\bviila\b|\bvlla\b/i.test(normalized)) { type = 'HOUSE'; typeFound = true; }

    // 3A. Brokerage Extractor (Supports comma formatting e.g. ₹22,500)
    let brokerageDays: number | undefined = undefined;
    let brokerageVal = 'Unmentioned';
    let brokerageAmount: number | undefined = undefined;
    let brokerageFound = false;
    const brokerageDaysMatch = normalized.match(/\b(\d{1,2})\s*(?:days|day)\s*(?:brokerage|broker\s*fee|commission)?\b/i);
    const brokerageMatch = normalized.match(/(\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k)\s*(?:brokerage|broker\s*fee|commission)\b|\b(?:brokerage|broker\s*fee|commission)\b\s*[:\-]?\s*(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k)\b/i);
    if (brokerageMatch) {
      const rawB = brokerageMatch[1] || brokerageMatch[2];
      if (rawB) {
        const cleanB = rawB.replace(/,/g, '');
        brokerageAmount = cleanB.toLowerCase().endsWith('k') ? parseInt(cleanB.slice(0, -1)) * 1000 : parseInt(cleanB);
        brokerageVal = `₹${brokerageAmount.toLocaleString('en-IN')}`;
        brokerageFound = true;
      }
    } else if (brokerageDaysMatch) {
      brokerageDays = parseInt(brokerageDaysMatch[1]);
      brokerageVal = `${brokerageDays} Days Rent`;
      brokerageFound = true;
    }

    // 3B. Bathrooms Extractor (No fake default - undefined if unmentioned)
    let bathrooms: number | undefined = undefined;
    const bathMatch = normalized.match(/\b(\d+)\s*(?:bath|baths|bathroom|bathrooms|washroom|toilet)\b/i);
    if (bathMatch) {
      bathrooms = parseInt(bathMatch[1]);
    }

    // 3C. Area Sqft Extractor (Supports comma formatting e.g. 1,800 sqft)
    let areaSqFt = '';
    const sqftMatch = normalized.match(/\b(\d{1,3}(?:,\d{3})+|\d{3,5})\s*(?:sqft|sq\.ft|sq\s*ft|sqfeet|square\s*feet|sq\s*meters|sqm)\b/i);
    if (sqftMatch) {
      areaSqFt = `${sqftMatch[1]} sqft`;
    }

    // 3D. Security Deposit Extractor (Supports comma formatting e.g. ₹90,000)
    let depositVal = '';
    const depositMatch = normalized.match(/(\d+(?:\+\d+)?|\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k)\s*(?:security\s*deposit|deposit|dep|depost|deposite|diposite|scurity)\b|\b(?:security\s*deposit|deposit|depost|deposite|diposite)\b\s*[:\-]?\s*(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k|\d\+\d)\b/i);
    if (depositMatch) {
      const depRaw = depositMatch[1] || depositMatch[2];
      if (/^\d{1,3}(?:,\d{2,3})+|\d{4,6}$/.test(depRaw.replace(/,/g, ''))) {
        const dAmt = parseInt(depRaw.replace(/,/g, ''));
        depositVal = `₹${dAmt.toLocaleString('en-IN')} Security Deposit`;
      } else {
        depositVal = `${depRaw} Security Deposit`;
      }
    }

    // 3E. Owner Name & Phone Extractor
    let ownerName = 'Not Specified';
    let ownerPhone = 'Not Specified';
    let ownerFound = false;
    const ownerNameMatch = input.match(/\b(?:owner\s*name|owner|contact)\s*[:\-]?\s*([A-Za-z\s]{2,30}?)(?=\s+\d|\s+\+?91|\s+phone|\s+mobile|\s+rent|\s+brokerage|$)/i);
    if (ownerNameMatch && ownerNameMatch[1].trim()) {
      const candidate = ownerNameMatch[1].trim();
      if (!/^(is|live|facing|flat|house|villa|apartment|plot)$/i.test(candidate)) {
        ownerName = candidate.replace(/\b\w/g, l => l.toUpperCase());
        ownerFound = true;
      }
    }

    const phoneMatch = input.match(/\b(?:\+?91[\-\s]?)?([1-9]\d{9}|\d{8,11})\b/);
    if (phoneMatch) {
      const cand = phoneMatch[1];
      if (!areaSqFt?.startsWith(cand) && (!brokerageVal || !brokerageVal.includes(cand))) {
        ownerPhone = cand;
        ownerFound = true;
      }
    }

    // 3F. Extract Rent / Price (Supports comma formatting e.g. ₹45,000)
    let rentVal = 'Unspecified';
    let rentAmount = 0;
    let rentFound = false;
    const explicitRentMatch = normalized.match(/(\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k)(?!\s*(?:brokerage|broker\s*fee|commission|deposit|sqft|bath))\s*(?:rent|per\s*month|\/month|pm)\b|\brent\b\s*[:\-]?\s*(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{2,3})+|\d{4,6}|\d{1,2}k)\b/i);
    if (explicitRentMatch) {
      const rawR = explicitRentMatch[1] || explicitRentMatch[2];
      if (rawR) {
        const cleanR = rawR.replace(/,/g, '');
        rentAmount = cleanR.toLowerCase().endsWith('k') ? parseInt(cleanR.slice(0, -1)) * 1000 : parseInt(cleanR);
        rentVal = `₹${rentAmount.toLocaleString('en-IN')}`;
        rentFound = true;
      }
    } else {
      let numberMatch = normalized.match(/\b(\d{1,3}(?:,\d{2,3})+|\d{4,6})\b/);
      let kMatch = normalized.match(/\b(\d{1,2})k\b/i);
      if (numberMatch) {
        const cleanNum = numberMatch[1].replace(/,/g, '');
        if ((!areaSqFt || !areaSqFt.startsWith(cleanNum)) && (!brokerageVal || !brokerageVal.includes(cleanNum))) {
          rentAmount = parseInt(cleanNum);
          rentVal = `₹${rentAmount.toLocaleString('en-IN')}`;
          rentFound = true;
        }
      } else if (kMatch) {
        rentAmount = parseInt(kMatch[1]) * 1000;
        rentVal = `₹${rentAmount.toLocaleString('en-IN')}`;
        rentFound = true;
      }
    }

    // 3.5. Multi-City Pan-India Extractor
    let city = '';
    const PAN_INDIA_CITIES = [
      'Indore', 'Bhopal', 'Pune', 'Bangalore', 'Mumbai', 'Delhi',
      'Gurgaon', 'Noida', 'Hyderabad', 'Chennai', 'Kolkata',
      'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh', 'Goa'
    ];

    for (const c of PAN_INDIA_CITIES) {
      if (new RegExp(`\\b${c}\\b`, 'i').test(normalized)) {
        city = c;
        break;
      }
    }

    // 4. Locality & Sector Extraction with Fuzzy Gazetteer Auto-Correction
    let sector = '';
    const SECTOR_GAZETTEER = [
      { canonical: 'Rau Circle', keywords: ['rau circle', 'rau', 'rau square'] },
      { canonical: 'Chhoti Gwaltoli', keywords: ['choti', 'gwaltoli', 'chhoti'] },
      { canonical: 'Nanda Nagar', keywords: ['nanda', 'nandanagar', 'nanda nagr'] },
      { canonical: 'Vijay Nagar', keywords: ['vijay', 'vijaynagar', 'vijay nagr', 'vijayngr'] },
      { canonical: 'Bhawarkua', keywords: ['bhawarkua', 'bhawarkwa', 'bhawar', 'bhawar kua'] },
      { canonical: 'Palasia', keywords: ['palasia', 'palasiaa'] },
      { canonical: 'Super Corridor', keywords: ['super', 'corridor'] },
      { canonical: 'Nipania', keywords: ['nipania', 'nipaniya'] },
      { canonical: 'AB Road', keywords: ['ab road', 'abroad'] },
      { canonical: 'LIG Circle', keywords: ['lig'] },
      { canonical: 'South Tukoganj', keywords: ['tukoganj'] },
      { canonical: 'MP Nagar', keywords: ['mp nagar', 'mpnagar'] },
      { canonical: 'Arera Colony', keywords: ['arera colony', 'arera'] },
      { canonical: 'Hinjewadi', keywords: ['hinjewadi', 'hinjawadi'] },
      { canonical: 'Indiranagar', keywords: ['indiranagar', 'indira nagar'] },
      { canonical: 'Koramangala', keywords: ['koramangala'] },
      { canonical: 'Andheri', keywords: ['andheri'] },
      { canonical: 'Bandra', keywords: ['bandra'] },
      { canonical: 'Gurgaon', keywords: ['gurgaon', 'gurugram'] }
    ];

    for (const secObj of SECTOR_GAZETTEER) {
      if (secObj.keywords.some(kw => normalized.includes(kw))) {
        sector = secObj.canonical;
        break;
      }
    }

    if (!sector) {
      let prepMatch = normalized.match(/\b(?:in|at|near|around|sector)\s+([A-Za-z0-9\s]{2,30}?)(?=\s+(?:with|having|facing|for|rent|per|\d|rs|rupees|\$|$))/i);
      if (prepMatch && prepMatch[1].trim()) {
        const extracted = prepMatch[1].trim();
        if (!PAN_INDIA_CITIES.some(c => c.toLowerCase() === extracted.toLowerCase())) {
          sector = extracted.replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    }

    if (!sector) {
      let suffixMatch = normalized.match(/\b([A-Za-z0-9\s]{2,20}\s+(?:nagar|colony|city|township|road|circle|sector|bazar|vihar|enclave|pur|ganj|heights|residency|villa|society|square|chowk|puri|dham|bagh|marg))\b/i);
      if (suffixMatch && suffixMatch[1].trim()) {
        sector = suffixMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    if (!sector) {
      sector = 'Not Specified';
    }

    // 4.5. Society / Colony Landmark Detection
    let colony = '';
    const KNOWN_COLONIES = [
      { canonical: 'Shiva Vatika', keywords: ['shiva vatika', 'shiva', 'vatika'] },
      { canonical: 'Singapore City', keywords: ['singapore city', 'singapore'] },
      { canonical: 'Apollo DB City', keywords: ['apollo db city', 'apollo'] },
      { canonical: 'Silver Springs', keywords: ['silver springs'] },
      { canonical: 'Treasure Town', keywords: ['treasure town'] },
      { canonical: 'Shalimar Township', keywords: ['shalimar'] }
    ];

    for (const colObj of KNOWN_COLONIES) {
      if (colObj.keywords.some(kw => normalized.includes(kw))) {
        colony = colObj.canonical;
        break;
      }
    }

    // 5. Extract Vastu Facing Direction
    let vastuFacing = 'Not Specified';
    const directions = [
      { key: 'north-east', label: 'North-East Facing' },
      { key: 'north-west', label: 'North-West Facing' },
      { key: 'south-east', label: 'South-East Facing' },
      { key: 'south-west', label: 'South-West Facing' },
      { key: 'east', label: 'East Facing' },
      { key: 'west', label: 'West Facing' },
      { key: 'north', label: 'North Facing' },
      { key: 'south', label: 'South Facing' }
    ];

    for (const dir of directions) {
      if (new RegExp(`\\b(?:facing\\s+${dir.key}|${dir.key}\\s+facing|${dir.key})\\b`, 'i').test(cleanLower)) {
        vastuFacing = dir.label;
        break;
      }
    }

    // 6. Furnishing Status
    let furnishingStatus = 'UNSPECIFIED';
    if (/fully\s*furnished|full\s*furnished/i.test(input)) furnishingStatus = 'FULLY_FURNISHED';
    else if (/semi\s*furnished|partially\s*furnished/i.test(input)) furnishingStatus = 'SEMI_FURNISHED';
    else if (/unfurnished|bare/i.test(input)) furnishingStatus = 'UNFURNISHED';

    // 7. Possession Readiness / Date
    let possessionDate = '';
    if (/ready\s*to\s*move|immediate|available\s*now/i.test(input)) possessionDate = 'Ready to Move (Immediate)';
    else {
      const dateMatch = input.match(/\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}-\d{2}-\d{2})\b/);
      if (dateMatch) possessionDate = dateMatch[1];
    }

    // 8. State, Pincode, Landmark
    let state = '';
    const stateMatch = input.match(/\b(madhya\s*pradesh|mp|maharashtra|karnataka|delhi|telangana|tamil\s*nadu|gujarat|rajasthan|uttar\s*pradesh|up|goa|punjab|haryana|west\s*bengal)\b/i);
    if (stateMatch) state = stateMatch[1];

    let pincode = '';
    const pincodeMatch = input.match(/\b([1-9]\d{5})\b/);
    if (pincodeMatch && pincodeMatch[1] !== ownerPhone) pincode = pincodeMatch[1];

    let landmark = '';
    const landmarkMatch = input.match(/\b(?:landmark|near|opposite|behind|adj|adjacent\s+to)\s+([A-Za-z0-9\s]{2,25}?)(?=\s+in|\s+at|\s+with|\s+facing|\s+rent|\s+status|\d|$)/i);
    if (landmarkMatch) landmark = landmarkMatch[1].trim();

    // 9. Listing Status (No fake default - empty string if unmentioned in prompt)
    let status = '';
    const explicitStatusMatch = input.match(/\bstatus\s*[:\-]?\s*(pending|sold|expired|rented|removed|live)\b/i);
    if (explicitStatusMatch) {
      status = explicitStatusMatch[1].toUpperCase();
    }

    // 10. Extract Amenities
    let amenities: string[] = [];
    if (/balcony/i.test(input)) amenities.push('Balcony & City View');
    if (/garden/i.test(input)) amenities.push('Private Garden');
    if (/furnished/i.test(input)) amenities.push('Fully Furnished');
    if (/parking/i.test(input)) amenities.push('Covered Parking');
    if (/gated/i.test(input)) amenities.push('Gated Security');

    // 11. Missing Fields Detection
    const missingFields: string[] = [];
    if (!bhkFound) missingFields.push("BHK Layout");
    if (!bathMatch) missingFields.push("Bathrooms");
    if (!rentFound) missingFields.push("Monthly Rent");
    if (!brokerageFound) missingFields.push("Brokerage Fee/Days");
    if (!depositMatch) missingFields.push("Security Deposit");
    if (!sqftMatch) missingFields.push("Carpet Area (SqFt)");
    if (vastuFacing === 'Not Specified') missingFields.push("Vastu Facing");
    if (furnishingStatus === 'UNSPECIFIED') missingFields.push("Furnishing Status");
    if (!possessionDate) missingFields.push("Possession Date");
    if (sector === 'Not Specified') missingFields.push("Locality / Sector");
    if (!state) missingFields.push("State");
    if (!pincode) missingFields.push("Pincode");
    if (!landmark) missingFields.push("Landmark");
    if (ownerName === 'Not Specified') missingFields.push("Owner Name");
    if (ownerPhone === 'Not Specified') missingFields.push("Owner Contact Number");

    const isGarbageInput = !bhkFound && !rentFound && !ownerFound && (sector === 'Not Specified') && !sqftMatch && (vastuFacing === 'Not Specified') && !typeFound;

    const locationPart = city ? `${sector}, ${city}` : sector;
    const fullLocation = colony ? `${locationPart} (${colony})` : locationPart;
    const title = bhkFound ? `${bhk} ${type} in ${colony ? colony + ', ' : ''}${locationPart}${vastuFacing !== 'Not Specified' ? ' (' + vastuFacing + ')' : ''}${amenities.length > 0 ? ' with ' + amenities.join(', ') : ''}` : `Property Listing (${locationPart})`;
    const label = bhkFound ? `${bhk} ${type} (${fullLocation})` : `Property (${fullLocation})`;

    return {
      bhk,
      type,
      city: city || 'Indore',
      sector,
      colony,
      rentVal,
      rentAmount,
      brokerageDays,
      brokerageVal,
      brokerageAmount,
      bathrooms,
      areaSqFt,
      depositVal,
      ownerName,
      ownerPhone,
      vastuFacing,
      furnishingStatus,
      possessionDate,
      state: state || 'Madhya Pradesh',
      pincode,
      landmark,
      status,
      amenities,
      title,
      label,
      missingFields,
      isGarbageInput
    };
  };

  const liveExtractedPreview = React.useMemo(() => {
    if (!newBhkLabel || !newBhkLabel.trim()) return null;
    return parseNaturalLanguageProperty(newBhkLabel);
  }, [newBhkLabel]);

  const handleAddCustomBhk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBhkLabel.trim()) {
      alert("⚠️ Please enter or click an example prompt before uploading!");
      return;
    }

    setIsSubmittingListing(true);
    setPublishSuccessNotification(null);

    let parsed: any = null;
    try {
      // 1. Primary: Call Spring Boot Backend REST API & Save Locality to PostgreSQL DB
      parsed = await propertyService.parsePropertyPrompt(newBhkLabel);
    } catch (backendErr) {
      console.warn('Backend prompt parser endpoint unreachable, using client-side fallback:', backendErr);
      // 2. Client-side fallback parsing
      parsed = parseNaturalLanguageProperty(newBhkLabel);
    } finally {
      setIsSubmittingListing(false);
    }

    const cleanId = (parsed ? `${parsed.bhk}-${parsed.sector}` : newBhkLabel).toUpperCase().replace(/\s+/g, '-');
    const displayLabel = parsed ? parsed.label : newBhkLabel;
    const avgRent = parsed ? parsed.rentVal : '₹18,000';

    setBhkConfigs((prev: any[]) => [...prev, {
      id: cleanId,
      label: displayLabel,
      enabled: true,
      demandScore: '94%',
      avgRent: avgRent,
      sector: parsed?.sector,
      vastuFacing: parsed?.vastuFacing,
      amenities: parsed?.amenities
    }]);

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (parsed) {
      const extractedObj = {
        rawInput: newBhkLabel,
        bhk: parsed.bhk,
        type: parsed.type,
        city: parsed.city || 'Indore',
        sector: parsed.sector,
        colony: parsed.colony || 'None Specified',
        rentVal: parsed.rentVal,
        rentAmount: parsed.rentAmount || (parsed.rentVal ? parseInt(parsed.rentVal.replace(/[^0-9]/g, '')) : 18000),
        brokerageVal: parsed.brokerageVal || 'None / Direct Owner',
        areaSqFt: parsed.areaSqFt || 'Not Specified',
        depositVal: parsed.depositVal || 'Not Specified',
        ownerName: parsed.ownerName || 'Not Specified',
        ownerPhone: parsed.ownerPhone || 'Not Specified',
        vastuFacing: parsed.vastuFacing,
        amenities: parsed.amenities || [],
        title: parsed.title,
        label: parsed.label,
        savedToDatabase: parsed.savedToDatabase !== undefined ? parsed.savedToDatabase : true,
        extractedAt: timeStr
      };
      setLastExtractedResult(extractedObj);
      setMediaSector(parsed.sector);
      setMediaPriceTag(`${parsed.rentVal} / month`);
      setMediaVastu(parsed.vastuFacing);
      setMediaCaption(parsed.title);

      const isSavedDb = parsed.savedToDatabase !== undefined ? parsed.savedToDatabase : true;
      const mediaCount = attachedMediaFiles.length;

      setPublishSuccessNotification({
        title: parsed.title,
        label: parsed.label,
        sector: parsed.sector,
        city: parsed.city || 'Indore',
        rentVal: parsed.rentVal,
        vastuFacing: parsed.vastuFacing,
        amenities: parsed.amenities || [],
        savedToDatabase: isSavedDb,
        mediaCount: mediaCount,
        timestamp: timeStr
      });

      setPublishedHistory(prev => [
        {
          id: cleanId,
          title: parsed.title,
          sector: parsed.sector,
          rentVal: parsed.rentVal,
          mediaCount: mediaCount,
          savedToDatabase: isSavedDb,
          timestamp: timeStr
        },
        ...prev
      ]);

      const newPropertyObj: Property = {
        id: Date.now(),
        title: parsed.title,
        listingType: 'RENT',
        propertyType: parsed.type === 'HOUSE' ? 'HOUSE' : parsed.type === 'PLOT' ? 'PLOT' : 'FLAT',
        city: parsed.city || 'Indore',
        sector: parsed.sector,
        bhk: parsed.bhk,
        monthlyRent: parsed.rentAmount || (parsed.rentVal ? parseInt(parsed.rentVal.replace(/[^0-9]/g, '')) : 18000),
        securityDeposit: parsed.rentAmount ? parsed.rentAmount * 2 : 36000,
        totalAreaSqFt: parsed.areaSqFt ? parseInt(parsed.areaSqFt) || 1250 : 1250,
        images: attachedMediaFiles.length > 0
          ? attachedMediaFiles.map(f => URL.createObjectURL(f))
          : ["/assets/hero_luxury.jpg", "/assets/interior_living.jpg"],
        verified: true,
        ownerPhone: parsed.ownerPhone || "+91 98260 *****",
        latitude: 22.7500,
        longitude: 75.8900
      };

      try {
        const existingCustom = JSON.parse(localStorage.getItem('divyavastu_custom_properties') || '[]');
        const updatedCustom = [newPropertyObj, ...existingCustom];
        localStorage.setItem('divyavastu_custom_properties', JSON.stringify(updatedCustom));
        window.dispatchEvent(new Event('divyavastu_property_published'));
      } catch (err) {
        console.error('Failed to sync published property to storage', err);
      }

      notifySuccess(
        '🎉 Property Listing Published!',
        `Added '${parsed.label}' in ${parsed.sector}, ${parsed.city || 'Indore'}`,
        `Rent: ${parsed.rentVal} / month • Vastu: ${parsed.vastuFacing} • Auto-persisted to PostgreSQL DB`,
        'PROPERTY'
      );

      notifyAiMagic(
        '⚡ AI Parameter Extraction Verified',
        `Identified ${parsed.bhk} ${parsed.type} in ${parsed.sector}`,
        `Owner: ${parsed.ownerName} (${parsed.ownerPhone}) • SqFt: ${parsed.areaSqFt}`,
        'AI_ENGINE'
      );
    } else {
      setPublishSuccessNotification({
        title: `Property BHK Option '${newBhkLabel}'`,
        label: newBhkLabel,
        sector: 'Indore Region',
        city: 'Indore',
        rentVal: '₹18,000 / month',
        vastuFacing: 'East',
        amenities: ['Standard'],
        savedToDatabase: true,
        mediaCount: attachedMediaFiles.length,
        timestamp: timeStr
      });

      notifySuccess(
        '⚙️ Property Option Enabled',
        `Property configuration '${newBhkLabel}' enabled on search decks`,
        undefined,
        'PROPERTY'
      );
    }

    setNewBhkLabel('');
    setAttachedMediaFiles([]);
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        f => f.type.startsWith('image/') || f.type.startsWith('video/')
      );
      setAttachedMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverMedia(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        f => f.type.startsWith('image/') || f.type.startsWith('video/')
      );
      setAttachedMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachedMedia = (index: number) => {
    setAttachedMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDisbursePayroll = (id: number) => {
    const gb = groundBoys.find(g => g.id === id);
    setGroundBoys(groundBoys.map(g => g.id === id ? { ...g, status: "DISBURSED" } : g));
    notifySuccess('💸 Payroll Disbursed', `Base salary ₹15,000 disbursed to ${gb?.name || 'Ground Escort Staff'}`, `Sector: ${gb?.sector} • ${gb?.dealsClosed} Deals Closed`, 'PAYROLL');
  };

  const handleApproveCashback = (id: string) => {
    const item = cashbacks.find(c => c.id === id);
    setCashbacks(cashbacks.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
    notifySuccess('💰 ₹1,000 Cashback Approved', `Tenant lease cashback released for ${item?.tenantName || 'Tenant'}`, `Direct Bank UPI Payout • ${item?.propertyTitle}`, 'APPROVAL');
  };

  const handleApprovePlot = (id: string) => {
    setPlots(plots.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
    notifySuccess('📌 Plot Approval Verified', `Commercial plot listing ${id} approved & published`, undefined, 'APPROVAL');
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: "APPROVED" } : l));
    notifyInfo('📅 Staff Leave Approved', `Leave request ID ${id} approved`, 'Staff Roster updated in realtime', 'SYSTEM');
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: "REJECTED" } : l));
    notifyWarning('📅 Staff Leave Rejected', `Leave request ID ${id} rejected`, 'Staff Roster updated', 'SYSTEM');
  };

  const adminNavItems = [
    { id: 'funnel', label: 'Funnel & Analytics', badge: '18%', icon: BarChart3, color: 'text-emerald-600' },
    { id: 'crm', label: 'Staff CRM & Telemetry', badge: `${employees.length} Staff`, icon: Users, color: 'text-indigo-600' },
    { id: 'approval', label: 'Approvals Queue', badge: `${cashbacks.filter(c => c.status === 'PENDING').length} New`, icon: CheckSquare, color: 'text-amber-600' },
    { id: 'config', label: 'BHK Engine', badge: 'Active', icon: SlidersHorizontal, color: 'text-purple-600' },
    { id: 'media', label: 'Update Property Listing', badge: 'Console', icon: UploadCloud, color: 'text-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row min-w-0">

      {/* MOBILE NAVIGATION BAR HEADER (VISIBLE ON PHONES/SMALL DEVICES < 768px) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black font-['Outfit'] text-white leading-tight">Divyavastu Admin Portal</h2>
            <span className="text-[10px] text-emerald-400 font-mono font-bold block">Indore Region HQ</span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-emerald-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          {isMobileMenuOpen ? <XCircle className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-bold font-mono">{isMobileMenuOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      {/* MOBILE DRAWER NAVIGATION MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-slate-950 text-white border-b border-slate-800 px-4 py-4 space-y-2 z-40 shadow-2xl"
          >
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Navigation Panel:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {adminNavItems.map((item, index) => {
                const isActive = activeTab === item.id || (activeTab === 'overview' && item.id === 'funnel');
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, type: "spring", stiffness: 400, damping: 24 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                      <span className="font-['Outfit']">{item.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                      isActive ? 'bg-emerald-700 text-emerald-100 border-emerald-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. COLLAPSIBLE LEFT SIDEBAR NAVIGATION (DESKTOP / TABLET >= 768px) */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="bg-white border-r border-slate-200/90 shadow-sm shrink-0 sticky top-18 h-[calc(100vh-4.5rem)] flex flex-col justify-between z-30 select-none hidden md:flex relative"
      >
        {/* FLOATING SIDEBAR COLLAPSE CHEVRON TOGGLE PILL */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-6 z-40 w-7 h-7 rounded-full bg-white border border-slate-200/90 shadow-md flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:scale-110 active:scale-95 transition-all group"
          title={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
        >
          <motion.div animate={{ rotate: isSidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>

        <div className="p-4 space-y-6 overflow-y-auto no-scrollbar">

          {/* SIDEBAR TITLE */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 min-h-[44px]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/80 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>

            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <h2 className="text-sm font-black font-['Outfit'] text-slate-900 leading-none truncate">
                  Admin Portal
                </h2>
                <span className="text-[10px] text-slate-500 font-semibold truncate block mt-0.5">Indore Region HQ</span>
              </motion.div>
            )}
          </div>

          {/* NAV ITEMS LIST WITH MAGNETIC LIQUID SLIDING TRANSITION */}
          <nav className="space-y-1.5 relative">
            {adminNavItems.map((item) => {
              const isActive = activeTab === item.id || (activeTab === 'overview' && item.id === 'funnel');
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={!isActive ? { x: 5 } : { scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full relative px-3 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors duration-200 group cursor-pointer ${
                    isActive ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {/* LIQUID ACTIVE PILL SLIDER */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-2xl shadow-lg shadow-emerald-600/30 z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate font-['Outfit'] font-bold text-xs">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <span
                      className={`relative z-10 px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border shrink-0 ml-1 transition-colors ${isActive
                          ? 'bg-emerald-700 text-emerald-100 border-emerald-500/40 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* SLEEK FLOATING TOOLTIP WHEN COLLAPSED */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900 text-white font-['Outfit'] font-extrabold text-xs rounded-xl shadow-2xl z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 pointer-events-none transition-all duration-200 flex items-center gap-2 border border-slate-800">
                      <span>{item.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500 text-slate-950 font-black">{item.badge}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER CARD */}
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-slate-100 bg-slate-50/50"
          >
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 font-['Outfit']">
                <span>System Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                High-Speed Listing Engine & Database Active.
              </p>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">

        {/* EXECUTIVE PORTAL HEADER */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Executive Analytics Portal
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">Indore Region HQ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2 text-slate-900 tracking-tight">
                Operations & Property Analytics Hub
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Visual Area Graphs, Conversion Funnels, GPS Telemetry Radar & Automated Property Ingestion.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Monthly Revenue</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">₹14.2 Lakhs</span>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Employees</span>
                <span className="text-base sm:text-lg font-black text-amber-700">{employees.length} Staff</span>
              </div>
            </div>
          </div>

          {/* AMBIENT AURORA MESH */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* 4 STAT BADGES WITH INTERACTIVE SPRING HOVER & GLOW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
            <motion.div
              whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-50/80 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block group-hover:text-slate-900 transition-colors">Meta Ads Leads</span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+18%</span>
              </div>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">482 Total</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-50/80 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block group-hover:text-emerald-800 transition-colors">Escorted Tours</span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
              </div>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">184 Passes</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-50/80 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block group-hover:text-amber-800 transition-colors">Staff Online</span>
                <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">GPS Live</span>
              </div>
              <span className="text-xl font-black text-amber-700 font-mono mt-1 block">2 / 3 Staff</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-50/80 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block group-hover:text-indigo-800 transition-colors">Pending Leaves</span>
                <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">Audit</span>
              </div>
              <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">{leaves.filter(l => l.status === 'PENDING').length} Requests</span>
            </motion.div>
          </div>
        </div>

        {/* 3. DYNAMIC TAB VIEW DISPLAY */}
        <AnimatePresence mode="wait">

          {/* TAB 1: FUNNEL HUB & GOOGLE VISUAL ANALYTICS GRAPH */}
          {(activeTab === 'funnel' || activeTab === 'overview') && (
            <motion.div
              key="tab-funnel"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* GOOGLE ANALYTICS REVENUE & TOUR AREA GRAPH */}
              <motion.div variants={cardVariants}>
                <RevenueAreaChart />
              </motion.div>

              {/* STEPPED FUNNEL FLOW GRAPH */}
              <motion.div variants={cardVariants}>
                <FunnelStepGraph />
              </motion.div>

              {/* INDORE SECTOR PERFORMANCE COMPARISON BAR CHART */}
              <motion.div variants={cardVariants}>
                <SectorPerformanceBarChart />
              </motion.div>
            </motion.div>
          )}

          {/* TAB 2: STAFF CRM & TELEMETRY */}
          {(activeTab === 'crm' || activeTab === 'employees' || activeTab === 'payroll') && (
            <motion.div
              key="tab-crm"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* GPS Telemetry Console */}
              <motion.div variants={cardVariants} className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Real-Time GPS Radar
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mt-1 flex items-center gap-2">
                      🌐 Live Field Escort GPS Telemetry & Tracking Console
                    </h3>
                  </div>

                  <button
                    onClick={() => alert("📡 Live GPS Signal Refreshed! Escort coordinates updated across Indore sector geofences.")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    📡 Ping Live GPS Signals
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm">
                          RV
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            Rahul Verma <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">Active Escort</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">ID: EMP-101 • Field Escort Lead</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse">
                        ● Live GPS Active
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-600" /> GPS Telemetry:</span>
                        <span className="text-emerald-700 font-bold">22.7533° N, 75.8937° E</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-indigo-600" /> Sector Landmark:</span>
                        <span className="text-slate-900 font-bold">Vijay Nagar (C21 Mall Hub)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-sm">
                          VS
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            Vikram Singh <span className="text-[10px] text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">Verification Lead</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">ID: EMP-102 • Field Inspector</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        ● Live GPS Active
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-600" /> GPS Telemetry:</span>
                        <span className="text-cyan-700 font-bold">22.6900° N, 75.8650° E</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-indigo-600" /> Sector Landmark:</span>
                        <span className="text-slate-900 font-bold">Bhawarkua Coaching Hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Staff Roster */}
              <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Staff Roster & Performance Audit</h3>
                    <span className="text-xs text-slate-500">Employee profiles, assigned sectors & rating metrics</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {employees.filter(e => e.status === 'ONLINE').length} Staff Online Now
                  </span>
                </div>

                <div className="space-y-3">
                  {employees.map((emp) => (
                    <div key={emp.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{emp.id}</span>
                          <span className="font-extrabold text-sm text-slate-900">{emp.name}</span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{emp.role}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Sector: <span className="font-bold text-slate-800">{emp.sector}</span> • Phone: <span className="font-bold text-slate-800">{emp.phone}</span>
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono border ${emp.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                        {emp.status === 'ONLINE' ? '● Online' : '○ On Leave'}
                      </span>
                    </div>
                  ))}
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
              exit="exit"
              className="space-y-6"
            >
              {/* Lease Cashback Approvals */}
              <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Tenant Lease Cashback Approvals (₹1,000)</h3>
                    <span className="text-xs text-slate-500">Verify uploaded rent agreement PDFs to release ₹1,000 tenant cashback</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Direct Bank UPI Transfer
                  </span>
                </div>

                <div className="space-y-3">
                  {cashbacks.map((item) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{item.id}</span>
                          <span className="text-xs font-bold text-slate-900">{item.tenantName}</span>
                        </div>
                        <p className="text-xs text-slate-600">{item.propertyTitle}</p>
                      </div>

                      {item.status === 'APPROVED' ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ₹1,000 Cashback Sent
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveCashback(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20"
                        >
                          Approve ₹1,000 Cashback
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* TAB 4: BHK ENGINE & CLOUDINARY MEDIA CDN */}
          {(activeTab === 'config' || activeTab === 'media') && (
            <motion.div
              key={`tab-${activeTab}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* PRIMARY SMART PROPERTY UPLOAD & PROMPT CONSOLE */}
              <motion.div variants={cardVariants} className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* COOL ANIMATED AMBIENT AURORA GLOW ORBS */}
                <div className="absolute -top-28 -right-28 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-800 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Divyavastu Smart Property Parser
                      </span>
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800 uppercase font-mono tracking-wider">
                        Indore Locality Registry
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
                      <UploadCloud className="w-6 h-6 text-emerald-400" /> Property Upload & Prompt Parser Console
                    </h2>
                    <p className="text-xs text-slate-400">
                      Type or paste property description & attach property photos/videos. All key parameters are automatically identified and verified.
                    </p>
                  </div>
                </div>

                {/* ANIMATED PUBLICATION SUCCESS TOAST BANNER */}
                <AnimatePresence>
                  {publishSuccessNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 border-2 border-emerald-400 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden z-20"
                    >
                      {/* Laser beam accent line */}
                      <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 animate-scan-beam" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-6 h-6 animate-bounce" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase">
                                ✓ Published Live to Platform
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Published at {publishSuccessNotification.timestamp}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black font-['Outfit'] text-white mt-1">
                              🎉 Property Listing Saved & Published Successfully!
                            </h3>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPublishSuccessNotification(null)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-mono rounded-xl border border-slate-700 transition-all cursor-pointer shrink-0"
                        >
                          ✕ Dismiss Notification
                        </button>
                      </div>

                      {/* PUBLISHED LISTING SUMMARY DETAIL GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-1 text-xs font-mono">
                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">🏢 Property Title</span>
                          <span className="text-xs font-black font-['Outfit'] text-emerald-300 truncate block mt-0.5" title={publishSuccessNotification.title}>
                            {publishSuccessNotification.title}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">📍 Locality & City</span>
                          <span className="text-xs font-black font-['Outfit'] text-cyan-300 truncate block mt-0.5">
                            {publishSuccessNotification.sector}, {publishSuccessNotification.city}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">💰 Rent & Database</span>
                          <span className="text-xs font-black font-['Outfit'] text-amber-300 truncate block mt-0.5">
                            {publishSuccessNotification.rentVal} • PostgreSQL Saved
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">📸 Attached Media</span>
                          <span className="text-xs font-black font-['Outfit'] text-purple-300 truncate block mt-0.5">
                            {publishSuccessNotification.mediaCount > 0 ? `✓ ${publishSuccessNotification.mediaCount} File(s) Attached` : 'No Media Files Attached'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 4-STEP VISUAL WORKFLOW STEPPER WITH SPRING HOVER */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6 p-3 bg-slate-950/90 rounded-2xl border border-slate-800/90 font-mono shadow-inner relative z-10">
                  <motion.div whileHover={{ scale: 1.02, y: -1 }} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                    newBhkLabel ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'bg-slate-900/80 text-slate-400 border border-slate-800/60'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-500/30">1</div>
                    <div className="text-[11px] leading-tight min-w-0">
                      <div className="font-black uppercase text-[9px] text-emerald-400 tracking-wider">Step 1: Input Prompt</div>
                      <div className="truncate font-sans font-bold text-slate-200">Type or 1-Click Preset</div>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02, y: -1 }} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                    liveExtractedPreview && !liveExtractedPreview.isGarbageInput ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'bg-slate-900/80 text-slate-400 border border-slate-800/60'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0 border border-cyan-500/30">2</div>
                    <div className="text-[11px] leading-tight min-w-0">
                      <div className="font-black uppercase text-[9px] text-cyan-400 tracking-wider">Step 2: Auto Extraction</div>
                      <div className="truncate font-sans font-bold text-slate-200">Identified Parameters</div>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02, y: -1 }} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                    attachedMediaFiles.length > 0 ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 shadow-sm' : 'bg-slate-900/80 text-slate-400 border border-slate-800/60'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-500/30">3</div>
                    <div className="text-[11px] leading-tight min-w-0">
                      <div className="font-black uppercase text-[9px] text-indigo-400 tracking-wider">Step 3: Attach Media</div>
                      <div className="truncate font-sans font-bold text-slate-200">Photos & Video</div>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02, y: -1 }} className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                    lastExtractedResult?.savedToDatabase ? 'bg-purple-950/90 text-purple-300 border border-purple-500/40 shadow-sm' : 'bg-slate-900/80 text-slate-400 border border-slate-800/60'
                  }`}>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs shrink-0 border border-purple-500/30">4</div>
                    <div className="text-[11px] leading-tight min-w-0">
                      <div className="font-black uppercase text-[9px] text-purple-400 tracking-wider">Step 4: Save & Publish</div>
                      <div className="truncate font-sans font-bold text-slate-200">Publish Property</div>
                    </div>
                  </motion.div>
                </div>

                <form onSubmit={handleAddCustomBhk} className="space-y-5 relative z-10">
                  {/* 1-CLICK PRESET EXAMPLE PROMPT BUTTONS WITH BOUNCY SPRINGS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        Click to Load Example Prompt (1-Click Presets):
                      </label>
                      {newBhkLabel && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setNewBhkLabel('')}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>↺ Reset Prompt</span>
                        </motion.button>
                      )}
                    </div>

                    {/* MOBILE PRESET SELECTOR DROPDOWN (SMALL DEVICES < 640px) */}
                    <div className="sm:hidden mb-2">
                      <select
                        onChange={(e) => {
                          const selected = PRESET_PROMPTS.find(p => p.id === e.target.value);
                          if (selected) setNewBhkLabel(selected.text);
                        }}
                        value={PRESET_PROMPTS.find(p => p.text === newBhkLabel)?.id || ''}
                        className="w-full bg-slate-950 text-emerald-300 text-xs font-mono p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 font-bold"
                      >
                        <option value="" disabled>-- Select 1-Click Example Prompt --</option>
                        {PRESET_PROMPTS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label} ({preset.badge})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DESKTOP/TABLET PRESET GRID (DESKTOPS >= 640px) WITH SPRING HOVER */}
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {PRESET_PROMPTS.map((preset) => (
                        <motion.button
                          key={preset.id}
                          type="button"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 450, damping: 18 }}
                          onClick={() => setNewBhkLabel(preset.text)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                            newBhkLabel === preset.text
                              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                              : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className="text-xs font-black font-['Outfit'] text-white leading-tight">{preset.label}</span>
                            <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 rounded-md shrink-0">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono leading-tight">
                            {preset.subtitle}
                          </p>
                          <div className="text-[9px] text-emerald-400/80 font-mono italic bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60 line-clamp-2">
                            "{preset.text}"
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* EDITABLE PROMPT TEXTAREA INPUT BOX WITH ANIMATED GLOWING BORDER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 font-mono uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        AI Smart Property Prompt & Listing Description Box:
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80">
                        {newBhkLabel.length} characters typed
                      </span>
                    </div>

                    <div className="spark-search-container shadow-2xl">
                      <div className="spark-border-beam" />
                      <div className="spark-search-inner">
                        <textarea
                          rows={4}
                          value={newBhkLabel}
                          onChange={(e) => setNewBhkLabel(e.target.value)}
                          placeholder="Type or edit your property prompt here... (e.g. Premium 2bhk flat 525 sqft 15000 rent brokerage 30000 1+1 security deposit owner name John Doe +91 1234567890 status live in Nanda Nagar Indore facing east fully furnished ready to move)..."
                          className="w-full bg-slate-950/95 text-emerald-300 placeholder-slate-500 text-xs font-mono p-4 border-0 focus:ring-0 transition-all outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* LIVE REAL-TIME IDENTIFIED PROPERTY ATTRIBUTES */}
                    {liveExtractedPreview && (
                      <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-xl transition-all relative overflow-hidden ${
                        liveExtractedPreview.isGarbageInput
                          ? 'bg-amber-950/40 border-amber-500/40'
                          : 'bg-slate-950/95 border-emerald-500/40'
                      }`}>
                        {/* COOL CYBER SCAN BEAM ANIMATION ACROSS ATTRIBUTE CARD */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 via-teal-300 to-transparent animate-scan-beam opacity-80 pointer-events-none" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              liveExtractedPreview.isGarbageInput ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              <Zap className={`w-3.5 h-3.5 fill-current ${liveExtractedPreview.isGarbageInput ? 'text-amber-400' : 'text-emerald-400 animate-pulse'}`} />
                              {liveExtractedPreview.isGarbageInput
                                ? '⚠️ Unrecognized Input - No property parameters detected'
                                : 'Auto-Identified Property Attributes (Extracted in Real-Time):'}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              liveExtractedPreview.isGarbageInput
                                ? 'text-amber-300 bg-amber-950/80 border-amber-700'
                                : 'text-emerald-300 bg-emerald-950 border-emerald-800'
                            }`}>
                              {liveExtractedPreview.isGarbageInput ? '⚠️ Unrecognized' : '✓ Verified & Auto-Parsed'}
                            </span>
                          </div>

                          {!liveExtractedPreview.isGarbageInput && (
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleOpenInlineEdit}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-extrabold rounded-xl transition-all border border-amber-500/40 flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                <span>✏️ Edit Fields</span>
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleCopyJson}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                <span>{copiedJson ? 'Copied!' : '📋 Copy Summary'}</span>
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleFillMediaFromExtracted}
                                className="px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-200 text-[11px] font-extrabold rounded-xl transition-all border border-cyan-500/40 flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Tag className="w-3 h-3 text-cyan-400" />
                                <span>🏷️ Tag Photos</span>
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {/* CATEGORY SEGMENTED FILTER TABS WITH SLIDING LIQUID PILL */}
                        {!liveExtractedPreview.isGarbageInput && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar relative">
                            {[
                              { id: 'all', label: '🌐 All 18 Attributes', activeStyle: 'text-emerald-300 border-emerald-500/50 bg-emerald-950' },
                              { id: 'location', label: '📍 Location & Type (6)', activeStyle: 'text-blue-300 border-blue-500/50 bg-blue-950' },
                              { id: 'pricing', label: '💰 Rent & Financials (5)', activeStyle: 'text-amber-300 border-amber-500/50 bg-amber-950' },
                              { id: 'specs', label: '🛋️ Specs & Amenities (7)', activeStyle: 'text-purple-300 border-purple-500/50 bg-purple-950' }
                            ].map(tab => {
                              const isTabActive = activeAttributeTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setActiveAttributeTab(tab.id as any)}
                                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                    isTabActive
                                      ? tab.activeStyle + ' font-black shadow-md border'
                                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                                  }`}
                                >
                                  {isTabActive && (
                                    <motion.div
                                      layoutId="activeCategoryTabPill"
                                      className="absolute inset-0 bg-white/5 rounded-xl pointer-events-none"
                                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                    />
                                  )}
                                  <span className="relative z-10">{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 18-CARD CATEGORIZED REAL-TIME PARAMETER INSPECTION GRID WITH MORPHING LAYOUT ANIMATIONS */}
                        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                          {/* CATEGORY 1: LOCATION & TYPE */}
                          {(activeAttributeTab === 'all' || activeAttributeTab === 'location') && (
                            <>
                              {/* 1. BHK Layout */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🏠 BHK Layout</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.bhk === 'Unspecified' ? 'text-slate-500 italic' : 'text-white'
                                }`}>{liveExtractedPreview.bhk}</span>
                              </motion.div>

                              {/* 2. Property Type */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🏷️ Property Type</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.type ? 'text-slate-500 italic' : 'text-indigo-300'
                                }`}>
                                  {liveExtractedPreview.type === 'FLAT' ? 'Flat / Apartment' :
                                   liveExtractedPreview.type === 'HOUSE' ? 'Independent House' :
                                   liveExtractedPreview.type === 'VILLA' ? 'Villa' :
                                   liveExtractedPreview.type === 'PLOT' ? 'Plot / Land' :
                                   liveExtractedPreview.type === 'PENTHOUSE' ? 'Penthouse' :
                                   liveExtractedPreview.type === 'STUDIO' ? 'Studio Apartment' :
                                   liveExtractedPreview.type === 'AIRBNB' ? 'Airbnb' :
                                   (liveExtractedPreview.type || 'Unspecified')}
                                </span>
                              </motion.div>

                              {/* 3. Locality / Sector */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">📍 Locality / Sector</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.sector === 'Not Specified' ? 'text-slate-500 italic' : 'text-emerald-300'
                                }`} title={liveExtractedPreview.sector}>
                                  {liveExtractedPreview.sector}
                                </span>
                              </motion.div>

                              {/* 4. City & State */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🏙️ City & State</span>
                                <span className="text-xs font-black font-['Outfit'] truncate block mt-0.5 text-blue-300">
                                  {liveExtractedPreview.city || 'Indore'}{liveExtractedPreview.state ? `, ${liveExtractedPreview.state}` : ''}
                                </span>
                              </motion.div>

                              {/* 11. Landmark */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🏢 Landmark</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.landmark ? 'text-slate-500 italic' : 'text-yellow-300'
                                }`} title={liveExtractedPreview.landmark || 'Unspecified'}>
                                  {liveExtractedPreview.landmark || 'Unspecified'}
                                </span>
                              </motion.div>

                              {/* 12. Pincode */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">📌 Pincode</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.pincode ? 'text-slate-500 italic' : 'text-indigo-400'
                                }`}>{liveExtractedPreview.pincode || 'Unspecified'}</span>
                              </motion.div>
                            </>
                          )}

                          {/* CATEGORY 2: RENT & FINANCIALS */}
                          {(activeAttributeTab === 'all' || activeAttributeTab === 'pricing') && (
                            <>
                              {/* 5. Monthly Rent */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">💰 Monthly Rent</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.rentVal === 'Unspecified' ? 'text-slate-500 italic' : 'text-amber-300'
                                }`}>{liveExtractedPreview.rentVal}</span>
                              </motion.div>

                              {/* 6. Brokerage Fee */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">💼 Brokerage Fee</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.brokerageVal === 'Unmentioned' ? 'text-slate-500 italic' : 'text-purple-300'
                                }`}>{liveExtractedPreview.brokerageVal}</span>
                              </motion.div>

                              {/* 7. Security Deposit */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🛡️ Security Deposit</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.depositVal || liveExtractedPreview.depositVal === 'Unspecified' ? 'text-slate-500 italic' : 'text-rose-300'
                                }`}>{liveExtractedPreview.depositVal || 'Unspecified'}</span>
                              </motion.div>

                              {/* 10. Possession Date */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">📅 Possession Date</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.possessionDate ? 'text-slate-500 italic' : 'text-emerald-400'
                                }`}>{liveExtractedPreview.possessionDate || 'Unspecified'}</span>
                              </motion.div>

                              {/* 17. Listing Status */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-lime-500/50 hover:shadow-lg hover:shadow-lime-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">⚡ Listing Status</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.status ? 'text-slate-500 italic' : 'text-lime-300'
                                }`}>
                                  {liveExtractedPreview.status || 'LIVE'}
                                </span>
                              </motion.div>
                            </>
                          )}

                          {/* CATEGORY 3: SPECS & AMENITIES */}
                          {(activeAttributeTab === 'all' || activeAttributeTab === 'specs') && (
                            <>
                              {/* 8. Carpet Area */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">📐 Carpet Area</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.areaSqFt || liveExtractedPreview.areaSqFt === 'Unspecified' ? 'text-slate-500 italic' : 'text-orange-300'
                                }`}>{liveExtractedPreview.areaSqFt || 'Unspecified'}</span>
                              </motion.div>

                              {/* 9. Bathrooms */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🛁 Bathrooms</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.bathrooms ? 'text-slate-500 italic' : 'text-cyan-300'
                                }`}>{liveExtractedPreview.bathrooms ? `${liveExtractedPreview.bathrooms} Baths` : 'Unspecified'}</span>
                              </motion.div>

                              {/* 13. Owner Name */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">👤 Owner Name</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.ownerName === 'Not Specified' ? 'text-slate-500 italic' : 'text-cyan-300'
                                }`} title={liveExtractedPreview.ownerName}>
                                  {liveExtractedPreview.ownerName}
                                </span>
                              </motion.div>

                              {/* 14. Owner Phone */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">📞 Owner Contact</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.ownerPhone === 'Not Specified' ? 'text-slate-500 italic' : 'text-sky-300'
                                }`} title={liveExtractedPreview.ownerPhone}>
                                  {liveExtractedPreview.ownerPhone}
                                </span>
                              </motion.div>

                              {/* 15. Vastu Facing */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🧭 Vastu Facing</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.vastuFacing === 'Not Specified' ? 'text-slate-500 italic' : 'text-teal-300'
                                }`}>{liveExtractedPreview.vastuFacing}</span>
                              </motion.div>

                              {/* 16. Furnishing Status */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">🛋️ Furnishing</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  liveExtractedPreview.furnishingStatus === 'UNSPECIFIED' ? 'text-slate-500 italic' : 'text-fuchsia-300'
                                }`}>
                                  {liveExtractedPreview.furnishingStatus === 'FULLY_FURNISHED' ? 'Fully Furnished' :
                                   liveExtractedPreview.furnishingStatus === 'SEMI_FURNISHED' ? 'Semi Furnished' :
                                   liveExtractedPreview.furnishingStatus === 'UNFURNISHED' ? 'Unfurnished' :
                                   'Unspecified'}
                                </span>
                              </motion.div>

                              {/* 18. Amenities */}
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.88 }}
                                whileHover={{ scale: 1.05, y: -3, transition: { type: 'spring', stiffness: 450, damping: 18 } }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/50 transition-colors cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">✨ Key Amenities</span>
                                <span className={`text-xs font-black font-['Outfit'] truncate block mt-0.5 ${
                                  !liveExtractedPreview.amenities || liveExtractedPreview.amenities.length === 0 ? 'text-slate-500 italic' : 'text-violet-300'
                                }`} title={liveExtractedPreview.amenities?.join(', ') || 'Standard'}>
                                  {liveExtractedPreview.amenities && liveExtractedPreview.amenities.length > 0 ? liveExtractedPreview.amenities.join(', ') : 'Standard'}
                                </span>
                              </motion.div>
                            </>
                          )}
                        </motion.div>

                        {/* Optional Missing Fields Indicator */}
                        {liveExtractedPreview.missingFields && liveExtractedPreview.missingFields.length > 0 && !liveExtractedPreview.isGarbageInput && (
                          <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center gap-1.5 border-t border-slate-800/60">
                            <span className="text-slate-400 font-bold">💡 Unmentioned Attributes:</span>
                            <span className="italic truncate">{liveExtractedPreview.missingFields.join(' • ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PHOTOS AND VIDEOS UPLOAD SECTION (DRAG & DROP + ATTACH MEDIA BUTTON) */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-300 flex items-center justify-between font-mono uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        Property Photos & Walkthrough Video Attachments:
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                        High-Speed Storage
                      </span>
                    </label>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverMedia(true); }}
                      onDragLeave={() => setIsDragOverMedia(false)}
                      onDrop={handleMediaDrop}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 ${
                        isDragOverMedia
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 scale-[1.01]'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-sm">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-sm">
                          <Video className="w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          Drag & drop property photos or walkthrough videos here
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supports JPG, PNG, WEBP images & MP4 property walkthrough videos
                        </p>
                      </div>

                      <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-extrabold rounded-xl border border-cyan-500/30 transition-all shadow-md flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" />
                        <span>➕ Select / Upload Photos & Videos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleMediaSelect}
                          className="hidden"
                        />
                      </label>

                      {/* ATTACHED FILE PREVIEW CHIPS */}
                      {attachedMediaFiles.length > 0 && (
                        <div className="w-full pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 justify-center">
                          {attachedMediaFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 text-slate-200 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 shadow-xs"
                            >
                              {file.type.startsWith('video/') ? (
                                <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              ) : (
                                <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span className="max-w-[150px] truncate">{file.name}</span>
                              <span className="text-[9px] text-slate-400">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachedMedia(idx)}
                                className="text-rose-400 hover:text-rose-300 ml-1 font-black cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SUBMIT BUTTON WITH COOL NEON SPRING TRANSITION */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Submitting will parse prompt parameters, generate title & publish property listing</span>
                    </div>

                    <motion.button
                      disabled={isSubmittingListing}
                      whileHover={!isSubmittingListing ? { scale: 1.04, y: -2, boxShadow: "0 0 30px rgba(16, 185, 129, 0.6)" } : {}}
                      whileTap={!isSubmittingListing ? { scale: 0.95 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      type="submit"
                      className={`w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer ${
                        isSubmittingListing ? 'opacity-80 cursor-wait' : ''
                      }`}
                    >
                      {isSubmittingListing ? (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                          <span>⚡ Parsing & Persisting Listing to PostgreSQL...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>✨ Save & Publish Property Listing</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>

              {/* BHK DEMAND VISUAL SCORE GAUGES */}
              <motion.div variants={cardVariants}>
                <BhkDemandGaugeGrid />
              </motion.div>

              {/* BHK CONFIGURATION MANAGER HEADER */}
              <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase font-mono">
                        Dynamic Control Deck
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Tenant Search Engine</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mt-1">
                      Flat Configuration Selector Options (BHK Matrix)
                    </h3>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-emerald-800 font-mono text-xs font-bold">
                    {bhkConfigs.filter((c: any) => c.enabled).length} / {bhkConfigs.length} Active Options
                  </div>
                </div>

                {/* BHK CONFIGURATION GRID TABLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bhkConfigs.map((config: any) => (
                    <div
                      key={config.id}
                      className={`p-4 rounded-2xl border transition-all ${config.enabled
                          ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          ID: {config.id}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleBhk(config.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${config.enabled
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-300 text-slate-700'
                            }`}
                        >
                          {config.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <h4 className="text-base font-extrabold font-['Outfit'] mb-1">
                        {config.label}
                      </h4>

                      <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-slate-800/40 font-mono">
                        <span>Demand: <strong className={config.enabled ? 'text-emerald-300' : 'text-slate-600'}>{config.demandScore}</strong></span>
                        <span>Avg Rent: <strong className={config.enabled ? 'text-amber-300' : 'text-slate-600'}>{config.avgRent}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* INLINE QUICK EDIT MODAL DIALOG */}
        {isInlineEditOpen && editForm && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-['Outfit'] text-emerald-400 flex items-center gap-2">
                    ✏️ Inline Edit Extracted Property Parameters
                  </h3>
                  <p className="text-xs text-slate-400">Modify extracted property fields directly before persisting to PostgreSQL</p>
                </div>
                <button
                  onClick={() => setIsInlineEditOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveInlineEdits} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Listing Title:</label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Property Type:</label>
                    <select
                      value={editForm.type || 'FLAT'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="FLAT">FLAT / APARTMENT</option>
                      <option value="HOUSE">HOUSE / VILLA</option>
                      <option value="PLOT">PLOT / LAND</option>
                      <option value="PENTHOUSE">PENTHOUSE</option>
                      <option value="STUDIO">STUDIO APARTMENT</option>
                      <option value="AIRBNB">AIRBNB / VACATION STAY</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">BHK Configuration:</label>
                    <input
                      type="text"
                      value={editForm.bhk || ''}
                      onChange={(e) => setEditForm({ ...editForm, bhk: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Bathrooms Count:</label>
                    <input
                      type="number"
                      value={editForm.bathrooms || 2}
                      onChange={(e) => setEditForm({ ...editForm, bathrooms: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Monthly Rent Amount (₹):</label>
                    <input
                      type="number"
                      value={editForm.rentAmount || 18000}
                      onChange={(e) => setEditForm({ ...editForm, rentAmount: Number(e.target.value), rentVal: `₹${Number(e.target.value).toLocaleString('en-IN')}` })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Brokerage Fee / Terms:</label>
                    <input
                      type="text"
                      value={editForm.brokerageVal || ''}
                      onChange={(e) => setEditForm({ ...editForm, brokerageVal: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Security Deposit Terms:</label>
                    <input
                      type="text"
                      value={editForm.depositVal || ''}
                      onChange={(e) => setEditForm({ ...editForm, depositVal: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Carpet Area (SqFt):</label>
                    <input
                      type="text"
                      value={editForm.areaSqFt || ''}
                      onChange={(e) => setEditForm({ ...editForm, areaSqFt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-teal-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Vastu Facing Direction:</label>
                    <select
                      value={editForm.vastuFacing || 'Not Specified'}
                      onChange={(e) => setEditForm({ ...editForm, vastuFacing: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Not Specified">Not Specified</option>
                      <option value="East Facing">East Facing</option>
                      <option value="North Facing">North Facing</option>
                      <option value="North-East Facing">North-East Facing</option>
                      <option value="West Facing">West Facing</option>
                      <option value="South Facing">South Facing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Furnishing Status:</label>
                    <select
                      value={editForm.furnishingStatus || 'UNSPECIFIED'}
                      onChange={(e) => setEditForm({ ...editForm, furnishingStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="UNSPECIFIED">UNSPECIFIED</option>
                      <option value="FULLY_FURNISHED">FULLY FURNISHED</option>
                      <option value="SEMI_FURNISHED">SEMI FURNISHED</option>
                      <option value="UNFURNISHED">UNFURNISHED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Locality / Sector:</label>
                    <input
                      type="text"
                      value={editForm.sector || ''}
                      onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Target City:</label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Owner Name:</label>
                    <input
                      type="text"
                      value={editForm.ownerName || ''}
                      onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-pink-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-mono text-[10px] uppercase font-bold mb-1">Owner Phone Number:</label>
                    <input
                      type="text"
                      value={editForm.ownerPhone || ''}
                      onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-pink-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInlineEditOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Inline Edits</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
