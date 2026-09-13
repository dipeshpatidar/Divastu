import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Filter, Sparkles } from 'lucide-react';

interface DataPoint {
  month: string;
  revenueLakhs: number;
  tours: number;
  leads: number;
  conversion: number;
}

const MONTHLY_DATA: DataPoint[] = [
  { month: 'Apr 2026', revenueLakhs: 6.2, tours: 74, leads: 210, conversion: 28.5 },
  { month: 'May 2026', revenueLakhs: 8.4, tours: 98, leads: 280, conversion: 31.2 },
  { month: 'Jun 2026', revenueLakhs: 10.1, tours: 124, leads: 340, conversion: 34.0 },
  { month: 'Jul 2026', revenueLakhs: 11.8, tours: 146, leads: 395, conversion: 35.8 },
  { month: 'Aug 2026', revenueLakhs: 13.0, tours: 168, leads: 430, conversion: 37.1 },
  { month: 'Sep 2026', revenueLakhs: 14.2, tours: 184, leads: 482, conversion: 38.1 },
];

export const RevenueAreaChart: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'tours' | 'leads'>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const maxVal = activeMetric === 'revenue' ? 16 : activeMetric === 'tours' ? 220 : 550;

  // Generate SVG Path for smooth curved area graph
  const getCoordinates = () => {
    const width = 650;
    const height = 200;
    const padding = 30;

    return MONTHLY_DATA.map((d, idx) => {
      const x = padding + (idx / (MONTHLY_DATA.length - 1)) * (width - 2 * padding);
      const val = activeMetric === 'revenue' ? d.revenueLakhs : activeMetric === 'tours' ? d.tours : d.leads;
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return { x, y, data: d };
    });
  };

  const points = getCoordinates();

  // Construct SVG Bezier Smooth Curve Path
  const makePath = () => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      path += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = makePath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      
      {/* HEADER & METRIC TOGGLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Google Analytics Visual Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">6-Month Trend</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mt-1">
            Monthly Revenue & Escort Tour Trajectory
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {[
            { id: 'revenue', label: 'Revenue (₹)', color: 'text-emerald-700' },
            { id: 'tours', label: 'Escorted Tours', color: 'text-indigo-700' },
            { id: 'leads', label: 'Meta Leads', color: 'text-amber-700' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMetric === m.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG GRAPH AREA */}
      <div className="relative overflow-x-auto no-scrollbar">
        <div className="min-w-[650px] relative">
          <svg viewBox="0 0 650 200" className="w-full h-56 overflow-visible">
            <defs>
              <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="indigoAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[40, 80, 120, 160].map((y, idx) => (
              <line
                key={idx}
                x1="30"
                y1={y}
                x2="620"
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area Fill */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              d={areaPath}
              fill={activeMetric === 'revenue' ? "url(#emeraldAreaGradient)" : "url(#indigoAreaGradient)"}
            />

            {/* Smooth Bezier Curve Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              d={linePath}
              fill="none"
              stroke={activeMetric === 'revenue' ? "#059669" : activeMetric === 'tours' ? "#4f46e5" : "#d97706"}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt.data)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill="#ffffff"
                  stroke={activeMetric === 'revenue' ? "#059669" : activeMetric === 'tours' ? "#4f46e5" : "#d97706"}
                  strokeWidth="3"
                  className="transition-transform hover:scale-150"
                />
                <text
                  x={pt.x}
                  y="190"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-slate-500"
                >
                  {pt.data.month.split(' ')[0]}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Hover Tooltip Card */}
          <AnimatePresence>
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute top-2 right-4 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 font-mono text-xs z-20 pointer-events-none space-y-1"
              >
                <div className="text-[10px] text-emerald-400 font-bold uppercase">{hoveredPoint.month}</div>
                <div className="font-extrabold text-white">Monthly Revenue: ₹{hoveredPoint.revenueLakhs} Lakhs</div>
                <div className="text-slate-300">Escorted Tours: {hoveredPoint.tours} Passes</div>
                <div className="text-amber-300">Meta Leads: {hoveredPoint.leads} | Conversion: {hoveredPoint.conversion}%</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
