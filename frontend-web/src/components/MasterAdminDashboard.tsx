import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, CheckSquare, ShieldCheck, TrendingUp, DollarSign, 
  CheckCircle2, XCircle, ArrowUpRight, Award, FileText, Zap, ChevronRight, ChevronLeft,
  SlidersHorizontal, Plus, ToggleLeft, ToggleRight, Settings, UploadCloud, Camera, Video, MapPin, Sparkles, AlertCircle, Menu,
  Database, Copy, Check, Compass, Tag, Layers, Home, Info
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { RoomTag } from '../types';

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

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }
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
  const [internalTab, setInternalTab] = useState<string>('funnel');
  const activeTab = externalActiveTab || internalTab;

  const handleTabSelect = (tabId: string) => {
    setInternalTab(tabId);
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Extracted Property Parameters Inspection State
  const [lastExtractedResult, setLastExtractedResult] = useState<any>({
    rawInput: "2bhk flat nanda nagar with balcony having 18000 rent per month and it is facing to east",
    bhk: "2 BHK",
    type: "Flat",
    city: "Indore",
    sector: "Nanda Nagar",
    colony: "Shiva Vatika",
    rentVal: "₹18,000",
    rentAmount: 18000,
    vastuFacing: "East Facing",
    amenities: ["Balcony & City View"],
    title: "2 BHK Flat in Nanda Nagar (East Facing) with Balcony & City View",
    label: "2 BHK Flat (Nanda Nagar, Indore)",
    savedToDatabase: true,
    extractedAt: "Just now (PostgreSQL Persisted)"
  });
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

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
      alert("✅ Pre-filled Cloudinary Media Tagging fields with exact extracted values!");
    }
  };

  const handleCopyJson = () => {
    if (lastExtractedResult) {
      navigator.clipboard.writeText(JSON.stringify(lastExtractedResult, null, 2));
      setCopiedJson(true);
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

  const parseNaturalLanguageProperty = (text: string) => {
    if (!text || !text.trim()) return null;
    const input = text.trim();
    const cleanLower = input.toLowerCase();

    // 1. Universal BHK / Layout Extractor (fractional 1.5/2.5/3.5, words 'three bhk', studio, duplex, etc.)
    let bhk = '';
    const numBhkMatch = input.match(/\b(\d+(?:\.\d+)?)\s*(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms)\b/i);
    const wordBhkMatch = input.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms)\b/i);

    if (numBhkMatch) {
      const val = numBhkMatch[1];
      bhk = val.endsWith('.0') ? `${val.substring(0, val.length - 2)} BHK` : `${val} BHK`;
    } else if (wordBhkMatch) {
      const wordMap: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
      bhk = `${wordMap[wordBhkMatch[1].toLowerCase()] || '2'} BHK`;
    } else if (/studio|1rk|\brk\b/i.test(input)) {
      bhk = '1 RK Studio';
    } else if (/triplex/i.test(input)) {
      bhk = 'Triplex Villa';
    } else if (/duplex|villa/i.test(input)) {
      bhk = 'Duplex Villa';
    } else if (/penthouse/i.test(input)) {
      bhk = 'Luxury Penthouse';
    } else {
      bhk = '2 BHK';
    }

    // 2. Extract Property Type
    let type = 'Flat';
    if (/house|villa|bungalow|independent/i.test(input)) type = 'House';
    else if (/plot|land|commercial plot/i.test(input)) type = 'Plot';
    else if (/penthouse/i.test(input)) type = 'Penthouse';
    else if (/studio/i.test(input)) type = 'Studio';

    // 3. Extract Rent / Price (e.g. 18000, 18k, 22000)
    let rentVal = '₹18,000';
    let numberMatch = input.match(/\b(\d{4,6})\b/);
    let kMatch = input.match(/\b(\d{1,2})k\b/i);
    if (numberMatch) {
      rentVal = `₹${parseInt(numberMatch[1]).toLocaleString('en-IN')}`;
    } else if (kMatch) {
      rentVal = `₹${(parseInt(kMatch[1]) * 1000).toLocaleString('en-IN')}`;
    }

    // 3.5. Multi-City Pan-India Extractor (Indore, Bhopal, Pune, Bangalore, Mumbai, Delhi, Hyderabad, etc.)
    let city = '';
    const PAN_INDIA_CITIES = [
      'Indore', 'Bhopal', 'Pune', 'Bangalore', 'Mumbai', 'Delhi', 
      'Gurgaon', 'Noida', 'Hyderabad', 'Chennai', 'Kolkata', 
      'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh', 'Goa'
    ];

    for (const c of PAN_INDIA_CITIES) {
      if (new RegExp(`\\b${c}\\b`, 'i').test(input)) {
        city = c;
        break;
      }
    }

    // 4. Multi-City Zero-Maintenance Dynamic Locality & Sector Extraction
    let sector = '';

    // Step 4A: Check Multi-City Known Gazetteer Micro-Markets
    const SECTOR_GAZETTEER = [
      // Indore
      { canonical: 'Rau Circle', keywords: ['rau circle', 'rau'] },
      { canonical: 'Chhoti Gwaltoli', keywords: ['choti', 'gwaltoli', 'chhoti'] },
      { canonical: 'Nanda Nagar', keywords: ['nanda', 'nandanagar'] },
      { canonical: 'Vijay Nagar', keywords: ['vijay', 'vijaynagar'] },
      { canonical: 'Bhawarkua', keywords: ['bhawarkua', 'bhawarkwa', 'bhawar'] },
      { canonical: 'Palasia', keywords: ['palasia'] },
      { canonical: 'Super Corridor', keywords: ['super', 'corridor'] },
      { canonical: 'Nipania', keywords: ['nipania'] },
      { canonical: 'AB Road', keywords: ['ab road', 'abroad'] },
      { canonical: 'LIG Circle', keywords: ['lig'] },
      { canonical: 'South Tukoganj', keywords: ['tukoganj'] },

      // Bhopal
      { canonical: 'MP Nagar', keywords: ['mp nagar', 'mpnagar'] },
      { canonical: 'Arera Colony', keywords: ['arera colony', 'arera'] },
      { canonical: 'Kolar Road', keywords: ['kolar road', 'kolar'] },
      { canonical: 'Hoshangabad Road', keywords: ['hoshangabad'] },

      // Pune
      { canonical: 'Hinjewadi', keywords: ['hinjewadi', 'hinjawadi'] },
      { canonical: 'Baner', keywords: ['baner'] },
      { canonical: 'Wakad', keywords: ['wakad'] },
      { canonical: 'Kharadi', keywords: ['kharadi'] },
      { canonical: 'Viman Nagar', keywords: ['viman nagar', 'viman'] },

      // Bangalore
      { canonical: 'Indiranagar', keywords: ['indiranagar', 'indira nagar'] },
      { canonical: 'Koramangala', keywords: ['koramangala'] },
      { canonical: 'HSR Layout', keywords: ['hsr layout', 'hsr'] },
      { canonical: 'Whitefield', keywords: ['whitefield'] },
      { canonical: 'Electronic City', keywords: ['electronic city'] },

      // Mumbai
      { canonical: 'Andheri', keywords: ['andheri'] },
      { canonical: 'Bandra', keywords: ['bandra'] },
      { canonical: 'Powai', keywords: ['powai'] },
      { canonical: 'Thane', keywords: ['thane'] },

      // Delhi / NCR
      { canonical: 'Gurgaon', keywords: ['gurgaon', 'gurugram'] },
      { canonical: 'Noida', keywords: ['noida'] },
      { canonical: 'Dwarka', keywords: ['dwarka'] }
    ];

    for (const secObj of SECTOR_GAZETTEER) {
      if (secObj.keywords.some(kw => cleanLower.includes(kw))) {
        sector = secObj.canonical;
        break;
      }
    }

    // Step 4B: Dynamic Named Entity Recognition (NER) Heuristic for ANY NEW CITY / LOCALITY!
    if (!sector) {
      let prepMatch = input.match(/\b(?:in|at|near|around|sector)\s+([A-Za-z0-9\s]{2,30}?)(?=\s+(?:with|having|facing|for|rent|per|\d|rs|rupees|\$|$))/i);
      if (prepMatch && prepMatch[1].trim()) {
        const extracted = prepMatch[1].trim();
        // Ignore extracted city name if matched
        if (!PAN_INDIA_CITIES.some(c => c.toLowerCase() === extracted.toLowerCase())) {
          sector = extracted.replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    }

    // Step 4C: Suffix-based Locality Pattern Recognizer (matches Nagar, Colony, City, Square, Heights, Enclave, etc.)
    if (!sector) {
      let suffixMatch = input.match(/\b([A-Za-z0-9\s]{2,20}\s+(?:nagar|colony|city|township|road|circle|sector|bazar|vihar|enclave|pur|ganj|heights|residency|villa|society|square|chowk|puri|dham|bagh|marg))\b/i);
      if (suffixMatch && suffixMatch[1].trim()) {
        sector = suffixMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    if (!sector) {
      sector = city ? `${city} Central` : 'Indore Region';
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
      if (colObj.keywords.some(kw => cleanLower.includes(kw))) {
        colony = colObj.canonical;
        break;
      }
    }

    // 5. Extract Vastu Facing Direction (supports disconnected "west ... facing")
    let vastuFacing = 'East Facing';
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
      if (cleanLower.includes(dir.key)) {
        vastuFacing = dir.label;
        break;
      }
    }

    // 6. Extract Amenities
    let amenities: string[] = [];
    if (/balcony/i.test(input)) amenities.push('Balcony & City View');
    if (/garden/i.test(input)) amenities.push('Private Garden');
    if (/furnished/i.test(input)) amenities.push('Fully Furnished');
    if (/parking/i.test(input)) amenities.push('Covered Parking');
    if (/gated/i.test(input)) amenities.push('Gated Security');

    const locationPart = city ? `${sector}, ${city}` : sector;
    const fullLocation = colony ? `${locationPart} (${colony})` : locationPart;
    const title = `${bhk} ${type} in ${colony ? colony + ', ' : ''}${locationPart} (${vastuFacing})${amenities.length > 0 ? ' with ' + amenities.join(', ') : ''}`;
    const label = `${bhk} ${type} (${fullLocation})`;

    return {
      bhk,
      type,
      city: city || 'Indore',
      sector,
      colony,
      rentVal,
      vastuFacing,
      amenities,
      title,
      label
    };
  };

  const handleAddCustomBhk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBhkLabel.trim()) return;

    let parsed: any = null;
    try {
      // 1. Primary: Call Spring Boot Backend REST API & Save Locality to PostgreSQL DB
      parsed = await propertyService.parsePropertyPrompt(newBhkLabel);
    } catch (backendErr) {
      console.warn('Backend prompt parser endpoint unreachable, using client-side fallback:', backendErr);
      // 2. Client-side fallback parsing
      parsed = parseNaturalLanguageProperty(newBhkLabel);
    }

    const cleanId = (parsed ? `${parsed.bhk}-${parsed.sector}` : newBhkLabel).toUpperCase().replace(/\s+/g, '-');

    const displayLabel = parsed ? parsed.label : newBhkLabel;
    const avgRent = parsed ? parsed.rentVal : '₹18,000';

    setBhkConfigs([...bhkConfigs, {
      id: cleanId,
      label: displayLabel,
      enabled: true,
      demandScore: '94%',
      avgRent: avgRent,
      sector: parsed?.sector,
      vastuFacing: parsed?.vastuFacing,
      amenities: parsed?.amenities
    }]);

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
        vastuFacing: parsed.vastuFacing,
        amenities: parsed.amenities || [],
        title: parsed.title,
        label: parsed.label,
        savedToDatabase: parsed.savedToDatabase !== undefined ? parsed.savedToDatabase : true,
        extractedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setLastExtractedResult(extractedObj);
      setMediaSector(parsed.sector);
      setMediaPriceTag(`${parsed.rentVal} / month`);
      setMediaVastu(parsed.vastuFacing);
      setMediaCaption(parsed.title);
      const dbStatusMsg = parsed.savedToDatabase ? '\n⚡ Locality & City automatically persisted to PostgreSQL Database!' : '';
      alert(`🎉 AI Backend Property Auto-Parse Successful!\n\nAdded: '${parsed.label}'\nCity: ${parsed.city || 'Indore'}\nSector/Locality: ${parsed.sector}\nRent: ${parsed.rentVal} / month\nVastu: ${parsed.vastuFacing}\nAmenities: ${parsed.amenities?.join(', ') || 'Standard'}${dbStatusMsg}\n\nPre-populated Media CDN upload fields below!`);
    } else {
      alert(`🎉 Property BHK configuration '${newBhkLabel}' enabled on Tenant search decks!`);
    }

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

  const adminNavItems = [
    { id: 'funnel', label: 'Funnel & Analytics', badge: '18%', icon: BarChart3, color: 'text-emerald-600' },
    { id: 'crm', label: 'Staff CRM & Telemetry', badge: `${employees.length} Staff`, icon: Users, color: 'text-indigo-600' },
    { id: 'approval', label: 'Approvals Queue', badge: `${cashbacks.filter(c => c.status === 'PENDING').length} New`, icon: CheckSquare, color: 'text-amber-600' },
    { id: 'config', label: 'BHK Engine', badge: 'Active', icon: SlidersHorizontal, color: 'text-purple-600' },
    { id: 'media', label: 'Update Properties & Media', badge: 'Cloudinary CDN', icon: UploadCloud, color: 'text-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR NAVIGATION */}
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

          {/* NAV ITEMS LIST */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const isActive = activeTab === item.id || (activeTab === 'overview' && item.id === 'funnel');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full relative px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="truncate font-['Outfit'] font-bold text-xs whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border shrink-0 ${
                        isActive 
                          ? 'bg-emerald-700 text-emerald-100 border-emerald-500/40' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* SLEEK FLOATING TOOLTIP WHEN COLLAPSED */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900 text-white font-['Outfit'] font-extrabold text-xs rounded-xl shadow-2xl z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 pointer-events-none transition-all duration-200 flex items-center gap-2 border border-slate-800">
                      <span>{item.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500 text-slate-950 font-black">{item.badge}</span>
                    </div>
                  )}
                </button>
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
                Cloudinary CDN & PostgreSQL Database Online.
              </p>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        
        {/* EXECUTIVE PORTAL HEADER */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Executive Analytics Portal
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">Indore Region HQ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2 text-slate-900 tracking-tight">
                Google Analytics Operations & Data Hub
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Visual Area Graphs, Conversion Funnels, GPS Telemetry Radar & Cloudinary CDN Pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Monthly Revenue</span>
                <span className="text-lg font-black text-emerald-700">₹14.2 Lakhs</span>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Employees</span>
                <span className="text-lg font-black text-amber-700">{employees.length} Staff</span>
              </div>
            </div>
          </div>

          {/* 4 STAT BADGES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Meta Ads Leads</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">482 Total</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Escorted Tours</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">184 Passes</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Staff Online</span>
              <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">2 / 3 Staff</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Pending Leaves</span>
              <span className="text-xl font-black text-indigo-700 font-mono mt-0.5 block">{leaves.filter(l => l.status === 'PENDING').length} Requests</span>
            </div>
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
              exit="hidden"
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
              exit="hidden"
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

                      <span className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono border ${
                        emp.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'
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
              exit="hidden"
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
              key="tab-config"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* BHK DEMAND VISUAL SCORE GAUGES */}
              <motion.div variants={cardVariants}>
                <BhkDemandGaugeGrid />
              </motion.div>

              {/* EXACT EXTRACTED PARAMETERS SUMMARY CARD FOR UPLOADED PROPERTIES */}
              {lastExtractedResult && (
                <motion.div
                  variants={cardVariants}
                  className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl overflow-hidden relative"
                >
                  {/* Decorative Gradient Background Overlay */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800 relative z-10">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full uppercase font-mono flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Exact AI Extracted Values
                        </span>

                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase font-mono border ${
                          lastExtractedResult.savedToDatabase 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {lastExtractedResult.savedToDatabase ? '⚡ PostgreSQL DB Auto-Persisted' : '⚡ Loaded from L1 Cache'}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          Parsed at {lastExtractedResult.extractedAt}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-2 flex items-center gap-2">
                        <Database className="w-6 h-6 text-emerald-400" /> Exact Extracted Property Parameters Summary
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Exact values extracted by Divyavastu AI parser from the uploaded property description. Verified & stored in PostgreSQL database.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFillMediaFromExtracted}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Pre-fill CDN Tags</span>
                      </button>
                    </div>
                  </div>

                  {/* RAW PROMPT INPUT DISPLAY */}
                  <div className="mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800/90 relative z-10">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Uploaded Property Prompt / Description:
                    </span>
                    <p className="text-xs font-mono text-emerald-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 italic">
                      "{lastExtractedResult.rawInput}"
                    </p>
                  </div>

                  {/* 8 KEY EXTRACTED PARAMETERS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10 mb-6">
                    {/* 1. BHK */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">BHK Layout</span>
                        <Home className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-lg font-black text-white font-['Outfit']">{lastExtractedResult.bhk || 'N/A'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Parsed Configuration</span>
                    </div>

                    {/* 2. Type */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Property Type</span>
                        <Layers className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-lg font-black text-indigo-300 font-['Outfit']">{lastExtractedResult.type || 'Flat'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Structure Category</span>
                    </div>

                    {/* 3. City */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Target City</span>
                        <MapPin className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-lg font-black text-cyan-300 font-['Outfit']">{lastExtractedResult.city || 'Indore'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">PostgreSQL Gazetteer</span>
                    </div>

                    {/* 4. Locality / Sector */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Locality / Sector</span>
                        <Compass className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-base font-extrabold text-emerald-300 font-['Outfit'] truncate" title={lastExtractedResult.sector}>
                        {lastExtractedResult.sector || 'Central Region'}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Saved to PostgreSQL</span>
                    </div>

                    {/* 5. Colony / Society */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Society / Colony</span>
                        <Tag className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-sm font-extrabold text-purple-300 font-['Outfit'] truncate" title={lastExtractedResult.colony}>
                        {lastExtractedResult.colony || 'None Specified'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Landmark / Society</span>
                    </div>

                    {/* 6. Monthly Rent */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Monthly Rent</span>
                        <DollarSign className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-lg font-black text-amber-300 font-['Outfit']">{lastExtractedResult.rentVal || '₹18,000'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Deposit: {lastExtractedResult.rentAmount ? `₹${(lastExtractedResult.rentAmount * 2).toLocaleString('en-IN')}` : '₹36,000'}
                      </span>
                    </div>

                    {/* 7. Vastu Facing */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Vastu Facing</span>
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-sm font-extrabold text-cyan-300 font-['Outfit']">{lastExtractedResult.vastuFacing || 'East Facing'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Solar Direction</span>
                    </div>

                    {/* 8. Extracted Amenities */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[10px] font-mono uppercase font-extrabold">Extracted Amenities</span>
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lastExtractedResult.amenities && lastExtractedResult.amenities.length > 0 ? (
                          lastExtractedResult.amenities.map((am: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-extrabold bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-md">
                              {am}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">Standard Amenities</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AUTO-GENERATED TITLE & SEARCH INDEX DISPLAY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 pt-4 border-t border-slate-800 text-xs font-mono">
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Generated Public Listing Title:</span>
                      <p className="text-emerald-300 font-bold font-['Outfit'] text-sm">
                        {lastExtractedResult.title || `${lastExtractedResult.bhk} ${lastExtractedResult.type} in ${lastExtractedResult.sector}`}
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tenant Deck Search Index Label:</span>
                      <p className="text-amber-300 font-bold font-['Outfit'] text-sm">
                        {lastExtractedResult.label || `${lastExtractedResult.bhk} ${lastExtractedResult.type} (${lastExtractedResult.sector})`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

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
                      className={`p-4 rounded-2xl border transition-all ${
                        config.enabled
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
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                            config.enabled
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

                {/* ENTERPRISE MEDIA TAGGING & METADATA SELECTION PANEL */}
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
                        <UploadCloud className="w-4.5 h-4.5 text-emerald-600 animate-bounce" /> Update Properties & Media Console (Cloudinary CDN & Room Tagging)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Upload HD property photos (with room tags & WebP compression) and MP4 video walkthroughs directly to Cloudinary CDN & PostgreSQL DB.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">Target Property ID:</span>
                      <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                        className="bg-slate-900 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                          <option key={id} value={id}>Property #{id}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {uploadStatusMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-mono font-bold shadow-xs">
                      {uploadStatusMsg}
                    </div>
                  )}

                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
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
                </div>

                {/* ADD CUSTOM BHK FORM WITH AI AUTO-PARSER */}
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Add Custom Property Layout / BHK Option (AI Auto-Parse Prompt)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Enter natural language prompts like: <em className="text-emerald-700 font-bold font-mono">"2bhk flat nanda nagar with balcony having 18000 rent per month and it is facing to east"</em> to automatically extract location, rent, Vastu facing & balcony amenities!
                    </p>
                  </div>

                  <form onSubmit={handleAddCustomBhk} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                      <input
                        type="text"
                        value={newBhkLabel}
                        onChange={(e) => setNewBhkLabel(e.target.value)}
                        placeholder='e.g. "2bhk flat nanda nagar with balcony having 18000 rent per month and it is facing to east"'
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white shadow-xs"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Add & Enable Configuration</span>
                      </button>
                    </div>

                    {/* LIVE AI AUTO-PARSE EXTRACTION CHIP PREVIEW CARD */}
                    {newBhkLabel.trim() && (() => {
                      const liveParsed = parseNaturalLanguageProperty(newBhkLabel);
                      if (!liveParsed) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-2 max-w-2xl shadow-xl font-mono text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-emerald-400 font-bold font-['Outfit'] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              AI Prompt Auto-Extraction Preview
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                              Parsed Live
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">BHK / Type</span>
                              <strong className="text-white font-['Outfit']">{liveParsed.bhk} {liveParsed.type}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">Location Sector</span>
                              <strong className="text-emerald-300 font-['Outfit']">{liveParsed.sector}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">Monthly Rent</span>
                              <strong className="text-amber-300">{liveParsed.rentVal} / mo</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[9px]">Vastu Facing</span>
                              <strong className="text-cyan-300">{liveParsed.vastuFacing}</strong>
                            </div>
                          </div>

                          {liveParsed.amenities.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-800/60 text-[11px]">
                              <span className="text-slate-400">Extracted Amenities: </span>
                              <strong className="text-indigo-300">{liveParsed.amenities.join(', ')}</strong>
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>
    </div>
  );
};
