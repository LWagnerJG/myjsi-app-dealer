// StandardsProgramDetailScreen - Detailed view of a single standards program
// Shows program overview, PO requirements, purchasing visibility, materials, attachments
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
  Shield, FileText, AlertTriangle, CheckCircle, Clock, Download, 
  ChevronRight, Calendar, User, Bell, Package, X
} from 'lucide-react';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { 
  getCustomerById, 
  getStandardsProgram, 
  STATUS_COLORS,
  VIEWER_ROLE 
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
const CodeChip = ({ code, theme, large = false }) => (
  <span 
    className={`inline-flex items-center rounded-xl font-mono font-bold ${large ? 'px-4 py-2 text-lg' : 'px-3 py-1.5 text-sm'}`}
    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
  >
    {code}
  </span>
);

// Section card wrapper
const SectionCard = ({ title, icon: Icon, children, theme, highlight = false, className = '' }) => (
  <GlassCard 
    theme={theme} 
    className={`p-5 ${className}`} 
    variant="elevated"
    style={highlight ? { border: `2px solid ${theme.colors.accent}` } : {}}
  >
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5" style={{ color: highlight ? theme.colors.accent : theme.colors.textSecondary }} />}
      <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>{title}</h3>
    </div>
    {children}
  </GlassCard>
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

// Notify Purchasing Modal (internal only)
const NotifyPurchasingModal = ({ isOpen, onClose, onNotify, theme, programCode }) => {
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    setTimeout(() => {
      onNotify();
      onClose();
      setNotified(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ backgroundColor: theme.colors.background }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Notify Purchasing</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>
        <div className="p-5">
          {notified ? (
            <div className="py-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
              <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Purchasing Notified!</p>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Notification sent for {programCode}</p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#FEF3C7' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#D97706' }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#92400E' }}>Purchasing Awareness Required</p>
                    <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                      This program requires purchasing department notification. Click below to send an automated notification.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                This will send a notification to the customer's purchasing team about program <strong>{programCode}</strong>.
              </p>
              <button 
                onClick={handleNotify}
                className="w-full py-3 rounded-full font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Bell className="w-4 h-4" />
                Send Notification
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Standards Program Detail Screen
export const StandardsProgramDetailScreen = ({ customerId, programId, theme, onNavigate, onBack }) => {
  const customer = useMemo(() => getCustomerById(customerId), [customerId]);
  const program = useMemo(() => getStandardsProgram(customerId, programId), [customerId, programId]);
  const isDesktop = useIsDesktop();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [purchasingNotified, setPurchasingNotified] = useState(!!program?.purchasingNotifiedAt);
  const isInternal = VIEWER_ROLE === 'internal';

  if (!customer || !program) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <p style={{ color: theme.colors.textSecondary }}>Program not found</p>
      </div>
    );
  }

  // Get linked materials
  const linkedMaterials = [];
  Object.entries(customer.approvedMaterials).forEach(([category, materials]) => {
    materials.forEach(mat => {
      if (mat.linkedStandardsProgramCodes?.includes(program.code)) {
        linkedMaterials.push({ ...mat, category });
      }
    });
  });

  const handleNotifyPurchasing = () => {
    setPurchasingNotified(true);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={program.status} />
              <CodeChip code={program.code} theme={theme} large />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
              {program.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
              {customer.name} • {customer.location.city}, {customer.location.state}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={`px-4 lg:px-6 py-4 pb-32 ${isDesktop ? 'max-w-4xl mx-auto' : ''}`}>
          <div className="space-y-4">
            
            {/* PO Requirements - Highlighted */}
            {program.poRequirementText && (
              <SectionCard title="PO Requirements" icon={FileText} theme={theme} highlight>
                <div className="p-4 rounded-xl" style={{ backgroundColor: theme.colors.accent + '10' }}>
                  <p className="font-semibold text-base" style={{ color: theme.colors.accent }}>
                    {program.poRequirementText}
                  </p>
                </div>
              </SectionCard>
            )}

            {/* Program Overview */}
            <SectionCard title="Program Overview" icon={Shield} theme={theme}>
              <p className="text-sm leading-relaxed mb-4" style={{ color: theme.colors.textSecondary }}>
                {program.summary}
              </p>
              <div className="space-y-0">
                <InfoRow label="Effective Dates" value={`${new Date(program.startDate).toLocaleDateString()} – ${new Date(program.endDate).toLocaleDateString()}`} theme={theme} />
                <InfoRow label="Status" value={program.status} theme={theme} />
                {program.ownerName && <InfoRow label="Program Owner" value={program.ownerName} theme={theme} />}
                <InfoRow label="Last Updated" value={new Date(program.lastUpdated).toLocaleDateString()} theme={theme} />
              </div>
            </SectionCard>

            {/* Special Notes / What's Special */}
            {program.specialNotes && program.specialNotes.length > 0 && (
              <SectionCard title="What's Special" icon={CheckCircle} theme={theme}>
                <ul className="space-y-2">
                  {program.specialNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                      <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{note}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Purchasing Visibility */}
            <SectionCard title="Purchasing Visibility" icon={Bell} theme={theme}>
              <div className="space-y-0">
                <InfoRow 
                  label="Purchasing awareness required" 
                  value={program.purchasingAwarenessRequired ? 'Yes' : 'No'} 
                  theme={theme}
                  highlight={program.purchasingAwarenessRequired}
                />
                {program.purchasingAwarenessRequired && (
                  <InfoRow 
                    label="Purchasing notified" 
                    value={purchasingNotified 
                      ? `Notified ${program.purchasingNotifiedAt ? new Date(program.purchasingNotifiedAt).toLocaleDateString() : 'today'}`
                      : 'Not yet notified'
                    } 
                    theme={theme}
                  />
                )}
              </div>
              
              {/* Internal-only: Notify Purchasing Button */}
              {isInternal && program.purchasingAwarenessRequired && !purchasingNotified && (
                <button 
                  onClick={() => setShowNotifyModal(true)}
                  className="mt-4 w-full py-3 rounded-full font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D97706' }}
                >
                  <Bell className="w-4 h-4" />
                  Notify Purchasing
                </button>
              )}
              
              {purchasingNotified && (
                <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: '#D1FAE5' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
                  <span className="text-sm font-medium" style={{ color: '#065F46' }}>Purchasing has been notified</span>
                </div>
              )}
            </SectionCard>

            {/* Linked Materials */}
            {linkedMaterials.length > 0 && (
              <SectionCard title="Materials & Parts Impacted" icon={Package} theme={theme}>
                <div className="space-y-2">
                  {linkedMaterials.map(mat => (
                    <div 
                      key={mat.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: theme.colors.subtle }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg border flex-shrink-0"
                        style={{ backgroundColor: mat.swatchHex || '#ccc', borderColor: theme.colors.border }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{mat.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{mat.code} • {mat.category}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mat.usageTags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onNavigate(`customers/${customerId}`)}
                  className="mt-3 text-sm font-medium flex items-center gap-1"
                  style={{ color: theme.colors.accent }}
                >
                  View all approved materials <ChevronRight className="w-4 h-4" />
                </button>
              </SectionCard>
            )}

            {/* Attachments */}
            {program.attachments && program.attachments.length > 0 && (
              <SectionCard title="Attachments" icon={FileText} theme={theme}>
                <div className="space-y-2">
                  {program.attachments.map(doc => (
                    <a 
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-black/5"
                      style={{ backgroundColor: theme.colors.subtle }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{doc.title}</span>
                      </div>
                      <Download className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Audit Info */}
            <SectionCard title="Audit" icon={Clock} theme={theme}>
              <div className="space-y-0">
                <InfoRow label="Last updated" value={new Date(program.lastUpdated).toLocaleDateString()} theme={theme} />
                {program.ownerName && <InfoRow label="Owner" value={program.ownerName} theme={theme} />}
              </div>
            </SectionCard>

          </div>
        </div>
      </div>

      {/* Notify Purchasing Modal */}
      <NotifyPurchasingModal 
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        onNotify={handleNotifyPurchasing}
        theme={theme}
        programCode={program.code}
      />
    </div>
  );
};

export default StandardsProgramDetailScreen;
