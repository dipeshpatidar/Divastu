import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { ShieldAlert, User, ShieldCheck, Briefcase, Lock } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

const ROLES: { id: UserRole; label: string; icon: any; color: string }[] = [
  { id: 'GUEST', label: 'GUEST', icon: User, color: 'bg-emerald-600' },
  { id: 'TENANT', label: 'TENANT', icon: User, color: 'bg-emerald-600' },
  { id: 'EMPLOYEE', label: 'EMPLOYEE (CRM)', icon: Briefcase, color: 'bg-indigo-600' },
  { id: 'SUB_ADMIN', label: 'SUB-ADMIN (LIMITED)', icon: Lock, color: 'bg-purple-600' },
  { id: 'SUPER_ADMIN', label: 'SUPER ADMIN (FULL)', icon: ShieldCheck, color: 'bg-amber-600' },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSelectRole }) => {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 text-white p-2 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold"
    >
      <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider px-2.5 flex items-center gap-1.5 border-r border-slate-800 mr-1">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Switch Role:
      </span>

      {ROLES.map((r) => {
        const isActive = currentRole === r.id;
        const Icon = r.icon;
        return (
          <motion.button
            key={r.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectRole(r.id)}
            className={`relative px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 z-10 ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="roleSwitcherIndicator"
                className={`absolute inset-0 ${r.color} rounded-xl shadow-md -z-10`}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              />
            )}
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            {r.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

