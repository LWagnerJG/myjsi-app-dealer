// StandardsProgramDetailModal - Modal view of a single standards program
// Shows high-level program information: PO requirements, overview, special notes, purchasing visibility
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
  Shield, FileText, AlertTriangle, CheckCircle, Bell, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { 
  getCustomerById, 
  getStandardsProgram, 
  STATUS_COLORS
} from '../../data/mockCustomers.js';

// Status badge component
const StatusBadge = ({ status, size = 'md' }) => {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-sm';
  return (
    <span 
      className={`inline-flex items-center rounded-full font-bold ${sizeClasses}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
};

// Code chip component
const CodeChip = ({ code, theme }) => (
  <span 
    className="inline-flex items-center px-3 py-1.5 rounded-xl font-mono font-bold text-sm"
    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
  >
    {code}
  </span>
);

// Info row component
const InfoRow = ({ label, value, theme, highlight = false }) => (
  <div className="flex items-start justify-between py-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{label}</span>
    <span className={`text-sm text-right max-w-[60%] ${highlight ? 'font-bold' : 'font-medium'}`} style={{ color: highlight ? theme.colors.accent : theme.colors.textPrimary }}>
      {value}
    </span>
  </div>
);

// Main Standards Program Detail Modal
export const StandardsProgramDetailModal = ({ isOpen, onClose, customerId, programId, theme }) => {
  const customer = useMemo(() => getCustomerById(customerId), [customerId]);
  const program = useMemo(() => getStandardsProgram(customerId, programId), [customerId, programId]);

  if (!isOpen || !customer || !program) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity duration-300 pointer-events-auto"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: DESIGN_TOKENS.zIndex.overlay 
            }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: DESIGN_TOKENS.zIndex.modal }}
          >
            <div 
              className="w-full max-w-2xl rounded-3xl overflow-hidden pointer-events-auto shadow-2xl max-h-[90vh] flex flex-col"
              style={{ backgroundColor: theme.colors.background }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: theme.colors.border }}>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={program.status} />
                    <CodeChip code={program.code} theme={theme} />
                  </div>
                  <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {program.title}
                  </h2>
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    {customer.name} • {customer.location.city}, {customer.location.state}
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 flex-shrink-0"
                  style={{ backgroundColor: theme.colors.subtle }}
                >
                  <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
                <div className="space-y-4">
                  
                  {/* PO Requirements - Highlighted */}
                  {program.poRequirementText && (
                    <GlassCard theme={theme} className="p-5" variant="elevated">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>PO Requirements</h3>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.accent + '10' }}>
                        <p className="font-semibold text-base" style={{ color: theme.colors.accent }}>
                          {program.poRequirementText}
                        </p>
                      </div>
                    </GlassCard>
                  )}

                  {/* Program Overview */}
                  <GlassCard theme={theme} className="p-5" variant="elevated">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                      <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Program Overview</h3>
                    </div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: theme.colors.textSecondary }}>
                      {program.summary}
                    </p>
                    <div className="space-y-0">
                      <InfoRow label="Effective Dates" value={`${new Date(program.startDate).toLocaleDateString()} — ${new Date(program.endDate).toLocaleDateString()}`} theme={theme} />
                      <InfoRow label="Status" value={program.status} theme={theme} />
                      {program.ownerName && <InfoRow label="Program Owner" value={program.ownerName} theme={theme} />}
                      <InfoRow label="Last Updated" value={new Date(program.lastUpdated).toLocaleDateString()} theme={theme} />
                    </div>
                  </GlassCard>

                  {/* Special Notes / What's Special */}
                  {program.specialNotes && program.specialNotes.length > 0 && (
                    <GlassCard theme={theme} className="p-5" variant="elevated">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>What's Special</h3>
                      </div>
                      <ul className="space-y-2">
                        {program.specialNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                            <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  )}

                  {/* Purchasing Visibility */}
                  <GlassCard theme={theme} className="p-5" variant="elevated">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                      <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Purchasing Visibility</h3>
                    </div>
                    <div className="space-y-0">
                      <InfoRow 
                        label="Purchasing awareness required" 
                        value={program.purchasingAwarenessRequired ? 'Yes' : 'No'} 
                        theme={theme}
                        highlight={program.purchasingAwarenessRequired}
                      />
                      {program.purchasingAwarenessRequired && program.purchasingNotifiedAt && (
                        <InfoRow 
                          label="Purchasing notified" 
                          value={`Notified ${new Date(program.purchasingNotifiedAt).toLocaleDateString()}`}
                          theme={theme}
                        />
                      )}
                    </div>
                  </GlassCard>

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Legacy export for backwards compatibility (if still used in routing)
export const StandardsProgramDetailScreen = ({ customerId, programId, theme, onNavigate, onBack }) => {
  // This is now a modal, so we'll just return null and let the modal be used directly
  return null;
};

export default StandardsProgramDetailModal;
