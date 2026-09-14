import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, Info, XCircle, Sparkles, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNotification, ToastNotification } from '../context/NotificationContext';

const ToastItem: React.FC<{ toast: ToastNotification; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!toast.duration || isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const getStyleProps = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/80 shadow-emerald-500/20',
          bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-950 to-slate-950',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          accent: 'bg-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
        };
      case 'ai_magic':
        return {
          border: 'border-cyan-400 shadow-cyan-500/25',
          bg: 'bg-gradient-to-r from-cyan-950/95 via-slate-950 to-purple-950/95',
          icon: <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse shrink-0" />,
          accent: 'bg-gradient-to-r from-cyan-400 to-purple-400',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
        };
      case 'warning':
        return {
          border: 'border-amber-400 shadow-amber-500/20',
          bg: 'bg-gradient-to-r from-amber-950/95 via-slate-950 to-slate-950',
          icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          accent: 'bg-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-500/40'
        };
      case 'error':
        return {
          border: 'border-rose-500 shadow-rose-500/20',
          bg: 'bg-gradient-to-r from-rose-950/95 via-slate-950 to-slate-950',
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          accent: 'bg-rose-500',
          badge: 'bg-rose-950 text-rose-300 border-rose-500/40'
        };
      case 'info':
      default:
        return {
          border: 'border-sky-500/80 shadow-sky-500/20',
          bg: 'bg-gradient-to-r from-sky-950/95 via-slate-950 to-slate-950',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          accent: 'bg-sky-400',
          badge: 'bg-sky-950 text-sky-300 border-sky-500/40'
        };
    }
  };

  const style = getStyleProps();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.88, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.82, y: -12, filter: 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full p-4 rounded-2xl border-2 ${style.border} ${style.bg} ${style.border} text-white shadow-2xl relative overflow-hidden backdrop-blur-xl group`}
    >
      {/* GLOWING LASER TIMER BEAM LINE */}
      {toast.duration && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: isPaused ? 1 : 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 right-0 h-[2.5px] origin-left ${style.accent}`}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5">{style.icon}</div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['Outfit'] font-black text-xs sm:text-sm text-white leading-tight">
                {toast.title}
              </span>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                {toast.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {toast.message}
            </p>

            {toast.details && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed overflow-hidden"
                    >
                      {toast.details}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {toast.action && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    onDismiss(toast.id);
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono rounded-lg border border-white/20 transition-all cursor-pointer"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
