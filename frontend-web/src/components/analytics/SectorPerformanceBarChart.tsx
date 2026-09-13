import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, TrendingUp } from 'lucide-react';

interface SectorStat {
  sector: string;
  activeListings: number;
  avgRent: number;
  toursCount: number;
  conversionPct: number;
}

const SECTOR_STATS: SectorStat[] = [
  { sector: 'Vijay Nagar', activeListings: 42, avgRent: 22500, toursCount: 78, conversionPct: 41.2 },
  { sector: 'Bhawarkua', activeListings: 38, avgRent: 18000, toursCount: 64, conversionPct: 38.5 },
  { sector: 'Old Palasia', activeListings: 24, avgRent: 26000, toursCount: 42, conversionPct: 29.1 },
  { sector: 'Super Corridor', activeListings: 19, avgRent: 16500, toursCount: 30, conversionPct: 22.4 },
];

export const SectorPerformanceBarChart: React.FC = () => {
  const maxListings = 50;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Indore Sector Micro-Market Bar Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time comparison of active listings, average 3BHK rent, and escort conversion rates.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          4 Key Sectors
        </span>
      </div>

      <div className="space-y-4">
        {SECTOR_STATS.map((s, idx) => {
          const widthPct = (s.activeListings / maxListings) * 100;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-900 font-['Outfit']">{s.sector}</span>
                <span className="font-mono text-slate-600 font-bold">
                  {s.activeListings} Homes • <strong className="text-emerald-700">₹{s.avgRent.toLocaleString('en-IN')}/mo</strong> • Conv: <strong className="text-amber-700">{s.conversionPct}%</strong>
                </span>
              </div>

              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200/80 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
