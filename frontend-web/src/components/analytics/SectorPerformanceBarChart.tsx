import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Building2, TrendingUp, DollarSign, Users, Award, 
  BarChart3, LayoutGrid, Layers, ArrowUpRight, Sparkles, Filter
} from 'lucide-react';

export interface SectorData {
  id: string;
  sector: string;
  activeListings: number;
  avgRent: number;
  toursCount: number;
  conversionPct: number;
  demandScore: number;
  tag: string;
  color: string;
}

const INDORE_SECTOR_DATA: SectorData[] = [
  {
    id: 'vijay-nagar',
    sector: 'Vijay Nagar',
    activeListings: 48,
    avgRent: 22500,
    toursCount: 84,
    conversionPct: 42.5,
    demandScore: 98,
    tag: 'Extreme Surge 🔥',
    color: 'emerald'
  },
  {
    id: 'bhawarkua',
    sector: 'Bhawarkua',
    activeListings: 42,
    avgRent: 18000,
    toursCount: 76,
    conversionPct: 39.1,
    demandScore: 92,
    tag: 'High Student Volume ⚡',
    color: 'teal'
  },
  {
    id: 'palasia',
    sector: 'Palasia & Old City',
    activeListings: 31,
    avgRent: 26500,
    toursCount: 58,
    conversionPct: 34.8,
    demandScore: 88,
    tag: 'Premium Prime 👑',
    color: 'indigo'
  },
  {
    id: 'super-corridor',
    sector: 'Super Corridor',
    activeListings: 28,
    avgRent: 16500,
    toursCount: 49,
    conversionPct: 28.4,
    demandScore: 85,
    tag: 'IT Hub Growth 🚀',
    color: 'cyan'
  },
  {
    id: 'nipania',
    sector: 'Nipania & Bypass',
    activeListings: 22,
    avgRent: 24000,
    toursCount: 41,
    conversionPct: 31.0,
    demandScore: 82,
    tag: 'Emerging Elite ✨',
    color: 'amber'
  },
  {
    id: 'rau',
    sector: 'Rau & AB Road',
    activeListings: 19,
    avgRent: 14500,
    toursCount: 35,
    conversionPct: 25.6,
    demandScore: 76,
    tag: 'Steady Growth 📈',
    color: 'rose'
  }
];

type MetricKey = 'activeListings' | 'avgRent' | 'toursCount' | 'conversionPct';
type ViewMode = 'vertical' | 'horizontal';

export const SectorPerformanceBarChart: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('activeListings');
  const [viewMode, setViewMode] = useState<ViewMode>('vertical');
  const [hoveredSector, setHoveredSector] = useState<SectorData | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'highest'>('highest');

  // Compute metric specifics
  const getMetricMeta = (key: MetricKey) => {
    switch (key) {
      case 'activeListings':
        return {
          label: 'Active Listings',
          unit: 'Homes',
          prefix: '',
          suffix: ' Listings',
          maxVal: 55,
          gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
          bgHighlight: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700',
          barColor: 'bg-gradient-to-t from-emerald-600 to-teal-400',
          accentHex: '#10b981'
        };
      case 'avgRent':
        return {
          label: 'Average Monthly Rent',
          unit: '₹/mo',
          prefix: '₹',
          suffix: '/mo',
          maxVal: 30000,
          gradient: 'from-amber-500 via-orange-500 to-yellow-400',
          bgHighlight: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
          barColor: 'bg-gradient-to-t from-amber-600 to-orange-400',
          accentHex: '#f59e0b'
        };
      case 'toursCount':
        return {
          label: 'Escorted Site Tours',
          unit: 'Visits',
          prefix: '',
          suffix: ' Tours',
          maxVal: 100,
          gradient: 'from-indigo-500 via-purple-500 to-pink-400',
          bgHighlight: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700',
          barColor: 'bg-gradient-to-t from-indigo-600 to-purple-400',
          accentHex: '#6366f1'
        };
      case 'conversionPct':
        return {
          label: 'Lead Conversion Rate',
          unit: '%',
          prefix: '',
          suffix: '%',
          maxVal: 50,
          gradient: 'from-cyan-500 via-teal-500 to-emerald-400',
          bgHighlight: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700',
          barColor: 'bg-gradient-to-t from-cyan-600 to-emerald-400',
          accentHex: '#06b6d4'
        };
    }
  };

  const meta = getMetricMeta(activeMetric);

  // Sorted sector list
  const sectors = [...INDORE_SECTOR_DATA].sort((a, b) => {
    if (sortBy === 'highest') {
      return b[activeMetric] - a[activeMetric];
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 select-none relative overflow-hidden">
      
      {/* HEADER BAR & METRIC TOGGLES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Indore Micro-Market Radar
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">6 Active Hubs</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] mt-1 tracking-tight flex items-center gap-2">
            Indore Sector Market Performance Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive real-time metrics comparing active listings, rental yields, escorted tours & lead conversions.
          </p>
        </div>

        {/* CONTROLS: VIEW MODE & SORT TOGGLES */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* SORT TOGGLE */}
          <button
            onClick={() => setSortBy(sortBy === 'highest' ? 'default' : 'highest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              sortBy === 'highest'
                ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Sort by highest value"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{sortBy === 'highest' ? 'Sorted High → Low' : 'Default Order'}</span>
          </button>

          {/* VERTICAL / HORIZONTAL SWITCHER */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('vertical')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'vertical'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vertical Bar Columns"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              onClick={() => setViewMode('horizontal')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'horizontal'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Horizontal Tracks"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Bars</span>
            </button>
          </div>

        </div>
      </div>

      {/* METRIC SELECTOR PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'activeListings', label: '🏠 Active Listings' },
          { key: 'avgRent', label: '💰 Avg Monthly Rent' },
          { key: 'toursCount', label: '🚶 Escorted Tours' },
          { key: 'conversionPct', label: '🎯 Lead Conversion %' }
        ].map((item) => {
          const isActive = activeMetric === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveMetric(item.key as MetricKey)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-800 shadow-md shadow-slate-900/20 scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC CHART DECK: VERTICAL OR HORIZONTAL */}
      {viewMode === 'vertical' ? (
        
        /* 1. VERTICAL COLUMN BAR GRAPH WITH SVG GRID LINES */
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-6 relative overflow-hidden shadow-inner">
          
          {/* TOP METRIC HIGHLIGHT STRIP */}
          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Viewing: <strong className="text-white font-['Outfit']">{meta.label}</strong>
            </span>
            <span className="text-slate-400">
              Peak: <strong className="text-emerald-400">{meta.prefix}{Math.max(...sectors.map(s => s[activeMetric])).toLocaleString('en-IN')}{meta.suffix}</strong>
            </span>
          </div>

          {/* SVG GRID CANVAS */}
          <div className="relative h-72 w-full flex items-end justify-between pt-8 pb-8 px-2 sm:px-6">
            
            {/* BACKGROUND HORIZONTAL GRID LINES (0%, 25%, 50%, 75%, 100%) */}
            <div className="absolute inset-x-6 top-8 bottom-8 flex flex-col justify-between pointer-events-none z-0">
              {[100, 75, 50, 25, 0].map((level) => (
                <div key={level} className="border-b border-slate-800/80 w-full flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <span className="-translate-y-2">{Math.round((meta.maxVal * level) / 100).toLocaleString()}</span>
                  <span className="-translate-y-2 opacity-50">{level}%</span>
                </div>
              ))}
            </div>

            {/* BAR COLUMNS */}
            {sectors.map((s, idx) => {
              const rawVal = s[activeMetric];
              const heightPct = Math.min(Math.max((rawVal / meta.maxVal) * 100, 8), 100);
              const isHovered = hoveredSector?.id === s.id;

              return (
                <div
                  key={s.id}
                  onMouseEnter={() => setHoveredSector(s)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group z-10 px-1 sm:px-3 cursor-pointer"
                >
                  {/* FLOATING BAR VALUE BADGE */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold font-mono transition-all shadow-md ${
                      isHovered
                        ? 'bg-emerald-500 text-slate-950 scale-110 shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {meta.prefix}{rawVal.toLocaleString('en-IN')}{meta.suffix}
                  </motion.div>

                  {/* GRADIENT COLUMN BAR */}
                  <div className="w-full max-w-[48px] bg-slate-800/60 rounded-2xl p-1 border border-slate-700/50 flex flex-col justify-end h-full overflow-hidden relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className={`w-full rounded-xl bg-gradient-to-t ${meta.gradient} transition-all duration-300 relative shadow-lg ${
                        isHovered ? 'brightness-125 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'group-hover:brightness-110'
                      }`}
                    >
                      {/* TOP CAP GLOW */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-xl" />
                    </motion.div>
                  </div>

                  {/* BOTTOM SECTOR NAME */}
                  <span className={`mt-3 text-[11px] font-extrabold font-['Outfit'] truncate max-w-[80px] text-center transition-colors ${
                    isHovered ? 'text-emerald-400 font-black' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {s.sector.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* BOTTOM QUICK FOOTER LEGEND */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">
            <span>💡 Tip: Hover over any column to inspect full micro-market breakdown.</span>
            <span className="text-emerald-400 font-bold">Source: Divyavastu Telemetry Engine</span>
          </div>

        </div>

      ) : (

        /* 2. HORIZONTAL TRACK BAR COMPARISON DECK */
        <div className="space-y-4 pt-2">
          {sectors.map((s, idx) => {
            const rawVal = s[activeMetric];
            const widthPct = Math.min(Math.max((rawVal / meta.maxVal) * 100, 5), 100);
            const isHovered = hoveredSector?.id === s.id;

            return (
              <motion.div
                key={s.id}
                onMouseEnter={() => setHoveredSector(s)}
                onMouseLeave={() => setHoveredSector(null)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/20 scale-[1.01]'
                    : 'bg-slate-50 text-slate-900 border-slate-200/90 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black font-['Outfit'] text-sm">{s.sector}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isHovered ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-200/80 text-slate-700 border-slate-300'
                    }`}>
                      {s.tag}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-black">
                    <span className={isHovered ? 'text-emerald-400' : 'text-slate-900'}>
                      {meta.prefix}{rawVal.toLocaleString('en-IN')}{meta.suffix}
                    </span>
                  </div>
                </div>

                {/* PROGRESS TRACK */}
                <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} shadow-sm relative ${
                      isHovered ? 'brightness-110 shadow-emerald-500/40' : ''
                    }`}
                  />
                </div>

                {/* COMPACT METRIC SUMMARY STRIP */}
                <div className="flex items-center justify-between text-[11px] font-mono mt-2 text-slate-500">
                  <span>Listings: <strong className={isHovered ? 'text-white' : 'text-slate-800'}>{s.activeListings}</strong></span>
                  <span>Avg Rent: <strong className="text-emerald-600 font-bold">₹{s.avgRent.toLocaleString('en-IN')}</strong></span>
                  <span>Tours: <strong className="text-indigo-600 font-bold">{s.toursCount}</strong></span>
                  <span>Conversion: <strong className="text-amber-600 font-bold">{s.conversionPct}%</strong></span>
                </div>
              </motion.div>
            );
          })}
        </div>

      )}

      {/* DYNAMIC HOVER TOOLTIP CARD MODAL */}
      <AnimatePresence>
        {hoveredSector && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black font-['Outfit'] text-sm text-white leading-none">
                    {hoveredSector.sector}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 block">
                    {hoveredSector.tag}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Demand Score</span>
                <span className="text-sm font-black text-amber-400">{hoveredSector.demandScore}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Listings</span>
                <span className="text-sm font-black text-white mt-0.5 block">{hoveredSector.activeListings} Homes</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Rent</span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 block">₹{hoveredSector.avgRent.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Escort Tours</span>
                <span className="text-sm font-black text-indigo-400 mt-0.5 block">{hoveredSector.toursCount} Visits</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Conversion</span>
                <span className="text-sm font-black text-amber-400 mt-0.5 block">{hoveredSector.conversionPct}% Rate</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
