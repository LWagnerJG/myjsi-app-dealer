// CustomerMicrositeScreen - Main microsite view for a single customer
// Displays Orders, Approved Materials, Standards Programs & Contracts, Install Gallery, Documents, Contacts
// Updated: section order, inset header, JSI rep contact info, share functionality
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
  FileText, Package, Image, Users, ChevronRight, Download, Plus, 
  CheckCircle, X, Send, MapPin, Shield, Phone, Mail, Share2, 
  Eye, Edit3, UserCog, Copy, Link2, Check, Box, FileCheck, DollarSign
} from 'lucide-react';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { useModalState } from '../../hooks/useModalState.js';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';
import { 
  getCustomerById, 
  getTypicalsForCustomer,
  STATUS_COLORS, 
  MATERIAL_CATEGORIES, 
  SPACE_TYPES
} from '../../data/mockCustomers.js';
import { StandardsProgramDetailModal } from './StandardsProgramDetailScreen.jsx';

// Status badge component
const StatusBadge = ({ status, size = 'md' }) => {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span 
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
};

// Code chip component for program codes
const CodeChip = ({ code, theme }) => (
  <span 
    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
    style={{ backgroundColor: theme.colors.accent + '15', color: theme.colors.accent }}
  >
    {code}
  </span>
);

// Section card wrapper
const SectionCard = ({ title, icon: Icon, children, theme, action, className = '' }) => (
  <GlassCard theme={theme} className={`p-5 ${className}`} variant="elevated">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5" style={{ color: theme.colors.accent }} />}
        <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </GlassCard>
);

// Chip tabs for filtering
const ChipTabs = ({ options, value, onChange, theme }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const isActive = opt.key === value;
      return (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            backgroundColor: isActive ? theme.colors.accent : theme.colors.subtle,
            color: isActive ? '#fff' : theme.colors.textSecondary,
          }}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// Material swatch item - simplified
const SwatchItem = ({ material, theme }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
    <div 
      className="w-8 h-8 rounded border flex-shrink-0"
      style={{ 
        backgroundColor: material.swatchHex || '#ccc',
        borderColor: theme.colors.border
      }}
    />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate" style={{ color: theme.colors.textPrimary }}>
        {material.name}
      </p>
      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
        {material.code} {material.vendor && `· ${material.vendor}`}
      </p>
    </div>
  </div>
);

// Order list item
const OrderItem = ({ order, theme, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-black/5"
    style={{ backgroundColor: theme.colors.subtle }}
  >
    <div className="text-left">
      <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
        {order.orderNumber}
      </p>
      {order.amount && (
        <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
          ${order.amount.toLocaleString()}
          {order.eta && ` � ETA: ${new Date(order.eta).toLocaleDateString()}`}
          {order.completedAt && ` � ${new Date(order.completedAt).toLocaleDateString()}`}
        </p>
      )}
    </div>
    <div className="flex items-center gap-2">
      <StatusBadge status={order.status} size="sm" />
      <ChevronRight className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
    </div>
  </button>
);

// Request Update Modal
const RequestUpdateModal = ({ isOpen, onClose, theme, customerName }) => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { openModal, closeModal } = useModalState();

  useEffect(() => {
    if (isOpen) {
      openModal();
      document.body.style.overflow = 'hidden';
      return () => {
        closeModal();
        document.body.style.overflow = '';
      };
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setMessage('');
      setSubmitted(false);
    }, 1500);
  };

  if (!isOpen) return null;

  // Calculate safe area padding for mobile bottom nav
  const mobileNavHeight = 80;
  const safeAreaBottom = typeof window !== 'undefined' ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) : 0;
  const bottomPadding = typeof window !== 'undefined' && window.innerWidth < 1024 
        ? mobileNavHeight + safeAreaBottom + 16 
        : 0;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity duration-300 pointer-events-auto"
        style={{ 
          top: 76,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: DESIGN_TOKENS.zIndex.overlay 
        }}
        onClick={onClose}
      />
      {/* Modal Container - positioned above bottom nav on mobile */}
      <div 
        className="fixed inset-x-0 flex items-end sm:items-center justify-center transition-transform duration-300 pointer-events-none"
        style={{ 
          top: 76,
          bottom: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${bottomPadding}px` : 0,
          padding: typeof window !== 'undefined' && window.innerWidth < 1024 ? '1rem' : '1.5rem',
          zIndex: DESIGN_TOKENS.zIndex.modal 
        }}
        onClick={onClose}
      >
        <div 
          className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden pointer-events-auto flex flex-col shadow-2xl"
          style={{ 
            backgroundColor: theme.colors.background,
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 1024
              ? `calc(100vh - ${76 + bottomPadding}px)`
              : '85vh',
          }}
          onClick={e => e.stopPropagation()}
        >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Request Update</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>
        <div 
          className="p-4 space-y-4 overflow-y-auto scrollbar-hide"
          style={{
            paddingBottom: typeof window !== 'undefined' && window.innerWidth < 1024 
              ? `calc(1rem + env(safe-area-inset-bottom, 0px))` 
              : '1rem'
          }}
        >
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
              <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Request Sent!</p>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Your JSI rep team has been notified.</p>
            </div>
          ) : (
            <>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Request changes or updates for <strong>{customerName}</strong>. Your JSI rep team will review and respond.
              </p>
              <textarea
                autoFocus
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the update you need..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: theme.colors.surface, 
                  border: `1.5px solid ${theme.colors.border}`, 
                  color: theme.colors.textPrimary,
                  focusRingColor: theme.colors.accent
                }}
              />
              <button 
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full py-3 rounded-full font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <Send className="w-4 h-4" />
                Send to Rep Team
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>,
    document.body
  );
};

// Access Level Options
const ACCESS_LEVELS = [
  { 
    key: 'viewer', 
    label: 'Viewer', 
    description: 'Can view all information but cannot make changes',
    icon: Eye 
  },
  { 
    key: 'editor', 
    label: 'Editor', 
    description: 'Can view and add photos, documents, and notes',
    icon: Edit3 
  },
  { 
    key: 'admin', 
    label: 'Admin', 
    description: 'Full access including managing materials and contacts',
    icon: UserCog 
  },
];

// Share Modal
const ShareModal = ({ isOpen, onClose, theme, customerName, customerId }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const { openModal, closeModal } = useModalState();

  useEffect(() => {
    if (isOpen) {
      openModal();
      document.body.style.overflow = 'hidden';
      return () => {
        closeModal();
        document.body.style.overflow = '';
      };
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/customers/${customerId}?access=${accessLevel}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (!email.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      onClose();
      setEmail('');
      setAccessLevel('viewer');
      setInviteSent(false);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setAccessLevel('viewer');
    setInviteSent(false);
    setLinkCopied(false);
  };

  if (!isOpen) return null;

  const mobileNavHeight = 80;
  const safeAreaBottom = typeof window !== 'undefined' ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) : 0;
  const bottomPadding = typeof window !== 'undefined' && window.innerWidth < 1024 
        ? mobileNavHeight + safeAreaBottom + 16 
        : 0;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity duration-300 pointer-events-auto"
        style={{ 
          top: 76,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: DESIGN_TOKENS.zIndex.overlay 
        }}
        onClick={handleClose}
      />
      {/* Modal Container */}
      <div 
        className="fixed inset-x-0 flex items-end sm:items-center justify-center transition-transform duration-300 pointer-events-none"
        style={{ 
          top: 76,
          bottom: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${bottomPadding}px` : 0,
          padding: typeof window !== 'undefined' && window.innerWidth < 1024 ? '1rem' : '1.5rem',
          zIndex: DESIGN_TOKENS.zIndex.modal 
        }}
        onClick={handleClose}
      >
        <div 
          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden pointer-events-auto flex flex-col shadow-2xl"
          style={{ 
            backgroundColor: theme.colors.background,
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 1024
              ? `calc(100vh - ${76 + bottomPadding}px)`
              : '85vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" style={{ color: theme.colors.accent }} />
              <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Share Access</h2>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
              <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5 overflow-y-auto scrollbar-hide">
            {inviteSent ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#059669' }} />
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Invite Sent!</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  {email} will receive access to {customerName}
                </p>
              </div>
            ) : (
              <>
                {/* Customer being shared */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: theme.colors.subtle }}>
                  <p className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>Sharing</p>
                  <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{customerName}</p>
                </div>

                {/* Access Level Selection */}
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>Access Level</p>
                  <div className="space-y-2">
                    {ACCESS_LEVELS.map(level => {
                      const Icon = level.icon;
                      const isSelected = accessLevel === level.key;
                      return (
                        <button
                          key={level.key}
                          onClick={() => setAccessLevel(level.key)}
                          className="w-full flex items-start gap-3 p-3 rounded-xl transition-all"
                          style={{ 
                            backgroundColor: isSelected ? theme.colors.accent + '15' : theme.colors.subtle,
                            border: `2px solid ${isSelected ? theme.colors.accent : 'transparent'}`
                          }}
                        >
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: isSelected ? theme.colors.accent : theme.colors.border }}
                          >
                            <Icon className="w-4 h-4" style={{ color: isSelected ? '#fff' : theme.colors.textSecondary }} />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                              {level.label}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                              {level.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.accent }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Invite */}
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>Invite by Email</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="flex-1 px-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        backgroundColor: theme.colors.surface, 
                        border: `1.5px solid ${theme.colors.border}`, 
                        color: theme.colors.textPrimary,
                      }}
                    />
                    <button 
                      onClick={handleSendInvite}
                      disabled={!email.trim() || !email.includes('@')}
                      className="px-5 py-3 rounded-full font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                      style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>

                {/* Copy Link */}
                <div className="pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                  <button 
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all"
                    style={{ 
                      backgroundColor: linkCopied ? '#05966920' : theme.colors.subtle,
                      color: linkCopied ? '#059669' : theme.colors.textPrimary
                    }}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Copy Shareable Link
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center mt-2" style={{ color: theme.colors.textSecondary }}>
                    Link will grant {ACCESS_LEVELS.find(l => l.key === accessLevel)?.label.toLowerCase()} access
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ============================================
// TYPICALS SECTION - Vision Casegood Configurations
// ============================================
const TypicalCard = ({ typical, theme, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const lowestPrice = Math.min(...typical.configurations.map(c => c.listPrice));
  
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:shadow-lg"
      style={{ 
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`
      }}
    >
      {/* Image */}
      <div 
        className="aspect-[4/3] relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: theme.colors.subtle }}
      >
        {!imageError ? (
          <img 
            src={typical.imageUrl}
            alt={typical.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Box className="w-12 h-12 mb-2" style={{ color: theme.colors.border }} />
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>3D Preview</span>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3 text-left">
        <h4 className="font-bold text-sm mb-0.5" style={{ color: theme.colors.textPrimary }}>
          {typical.name}
        </h4>
        <p className="text-[11px] mb-2" style={{ color: theme.colors.textSecondary }}>
          {typical.dimensions}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: theme.colors.accent }}>
            From ${lowestPrice.toLocaleString()}
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: theme.colors.border }} />
        </div>
      </div>
    </button>
  );
};

const TypicalDetailModal = ({ typical, isOpen, onClose, theme }) => {
  const { openModal, closeModal } = useModalState();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      openModal();
      document.body.style.overflow = 'hidden';
      return () => {
        closeModal();
        document.body.style.overflow = '';
      };
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  if (!isOpen || !typical) return null;

  const mobileNavHeight = 80;
  const safeAreaBottom = typeof window !== 'undefined' ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) : 0;
  const bottomPadding = typeof window !== 'undefined' && window.innerWidth < 1024 
        ? mobileNavHeight + safeAreaBottom + 16 
        : 0;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 transition-opacity duration-300 pointer-events-auto"
        style={{ 
          top: 76,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: DESIGN_TOKENS.zIndex.overlay 
        }}
        onClick={onClose}
      />
      <div 
        className="fixed inset-x-0 flex items-end sm:items-center justify-center transition-transform duration-300 pointer-events-none"
        style={{ 
          top: 76,
          bottom: typeof window !== 'undefined' && window.innerWidth < 1024 ? `${bottomPadding}px` : 0,
          padding: typeof window !== 'undefined' && window.innerWidth < 1024 ? '1rem' : '1.5rem',
          zIndex: DESIGN_TOKENS.zIndex.modal 
        }}
        onClick={onClose}
      >
        <div 
          className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden pointer-events-auto flex flex-col shadow-2xl"
          style={{ 
            backgroundColor: theme.colors.background,
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 1024
              ? `calc(100vh - ${76 + bottomPadding}px)`
              : '85vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
            <div>
              <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{typical.name}</h2>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{typical.dimensions}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
              <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Image */}
            <div 
              className="aspect-square flex items-center justify-center p-6"
              style={{ backgroundColor: theme.colors.subtle }}
            >
              {!imageError ? (
                <img 
                  src={typical.imageUrl}
                  alt={typical.name}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <Box className="w-20 h-20 mb-3" style={{ color: theme.colors.border }} />
                  <span className="text-sm" style={{ color: theme.colors.textSecondary }}>3D Preview</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {typical.description}
              </p>
            </div>

            {/* Configurations/Pricing */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                <DollarSign className="w-4 h-4" style={{ color: theme.colors.accent }} />
                Configuration Pricing
              </h3>
              {typical.configurations.map(config => (
                <div 
                  key={config.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: theme.colors.subtle }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                      {config.sku} <span className="font-normal" style={{ color: theme.colors.textSecondary }}>{config.finish}</span>
                    </p>
                  </div>
                  <p className="font-bold text-base" style={{ color: theme.colors.accent }}>
                    ${config.listPrice.toLocaleString()}
                  </p>
                </div>
              ))}
              <p className="text-[10px] text-center pt-2" style={{ color: theme.colors.textSecondary }}>
                List pricing shown. Contact your JSI rep for discounted pricing.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full font-semibold text-sm"
              style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

const TypicalsSection = ({ customerId, theme, isDesktop }) => {
  const typicals = useMemo(() => getTypicalsForCustomer(customerId), [customerId]);
  const [selectedTypical, setSelectedTypical] = useState(null);

  if (typicals.length === 0) return null;

  return (
    <>
      <SectionCard title="Typicals" icon={Box} theme={theme}>
        <p className="text-xs mb-4" style={{ color: theme.colors.textSecondary }}>
          Pre-configured Vision casegood workstations with list pricing
        </p>
        <div className={`grid gap-3 ${isDesktop ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {typicals.slice(0, isDesktop ? 6 : 4).map(typical => (
            <TypicalCard 
              key={typical.id}
              typical={typical}
              theme={theme}
              onClick={() => setSelectedTypical(typical)}
            />
          ))}
        </div>
        {typicals.length > (isDesktop ? 6 : 4) && (
          <button 
            className="w-full mt-4 py-2.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}
          >
            View All {typicals.length} Typicals
          </button>
        )}
      </SectionCard>

      <TypicalDetailModal
        typical={selectedTypical}
        isOpen={!!selectedTypical}
        onClose={() => setSelectedTypical(null)}
        theme={theme}
      />
    </>
  );
};

// Main Customer Microsite Component
export const CustomerMicrositeScreen = ({ customerId, theme, onNavigate, onBack }) => {
  const customer = useMemo(() => getCustomerById(customerId), [customerId]);
  const isDesktop = useIsDesktop();
  const scrollRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [materialCategory, setMaterialCategory] = useState('laminates');
  const [orderTab, setOrderTab] = useState('current');
  const [photoFilter, setPhotoFilter] = useState('All');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const fileInputRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setIsScrolled(scrollRef.current.scrollTop > 10);
  }, []);

  if (!customer) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <p style={{ color: theme.colors.textSecondary }}>Customer not found</p>
      </div>
    );
  }

  // Filtered materials
  const materials = customer.approvedMaterials[materialCategory] || [];
  
  // Filtered photos
  const filteredPhotos = photoFilter === 'All' 
    ? customer.installs 
    : customer.installs.filter(p => p.spaceType === photoFilter);

  // Stats for "At a Glance"
  const activeStandards = customer.standardsPrograms.filter(p => p.status === 'Active').length;
  const currentOrders = customer.orders.current.length;
  const lastInstall = customer.installs[0]?.date;
  const primaryRep = customer.contacts.find(c => c.visibility === 'dealer' && c.role.includes('JSI'));

  // Desktop right rail content
  const AtAGlanceCard = () => (
    <GlassCard theme={theme} className="p-5 sticky top-4" variant="elevated">
      <h3 className="font-bold text-sm mb-4" style={{ color: theme.colors.textPrimary }}>At a Glance</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Active Standards</span>
          <span className="font-bold" style={{ color: theme.colors.accent }}>{activeStandards}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Current Orders</span>
          <span className="font-bold" style={{ color: theme.colors.accent }}>{currentOrders}</span>
        </div>
        {lastInstall && (
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Last Installation</span>
            <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              {new Date(lastInstall).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      {/* Your JSI Rep Section */}
      {primaryRep && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.colors.border }}>
          <h4 className="font-bold text-xs mb-3 uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>Your JSI Rep</h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
              <Users className="w-5 h-5" style={{ color: theme.colors.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{primaryRep.name}</p>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{primaryRep.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            {primaryRep.email && (
              <a 
                href={`mailto:${primaryRep.email}`}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-black/5"
                style={{ backgroundColor: theme.colors.subtle }}
              >
                <Mail className="w-4 h-4" style={{ color: theme.colors.accent }} />
                <span className="text-xs font-medium" style={{ color: theme.colors.textPrimary }}>{primaryRep.email}</span>
              </a>
            )}
            {primaryRep.phone && (
              <a 
                href={`tel:${primaryRep.phone}`}
                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-black/5"
                style={{ backgroundColor: theme.colors.subtle }}
              >
                <Phone className="w-4 h-4" style={{ color: theme.colors.accent }} />
                <span className="text-xs font-medium" style={{ color: theme.colors.textPrimary }}>{primaryRep.phone}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      {/* Content */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={`px-4 lg:px-6 ${isDesktop ? 'flex gap-6 max-w-6xl mx-auto pb-8' : 'pb-44'}`}>
          {/* Main Content Column */}
          <div className={`space-y-4 ${isDesktop ? 'flex-1' : ''}`}>
            
            {/* Customer Header - Simple inset header with share button */}
            <div className="pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                    {customer.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                      <span className="text-xs lg:text-sm" style={{ color: theme.colors.textSecondary }}>
                        {customer.location.city}, {customer.location.state}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary }}>
                      {customer.vertical}
                    </span>
                  </div>
                </div>
                {/* Share button - emphasized with accent styling */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1.5px solid ${theme.colors.accent}30`
                  }}
                  title="Share access to this customer"
                >
                  <Share2 className="w-4 h-4" style={{ color: theme.colors.accent }} />
                  <span className="text-xs font-semibold" style={{ color: theme.colors.accent }}>
                    Share
                  </span>
                </button>
              </div>
            </div>

            {/* Orders - FIRST */}
            <SectionCard title="Orders" icon={Package} theme={theme}>
              <ChipTabs 
                options={[
                  { key: 'current', label: `Current (${customer.orders.current.length})` },
                  { key: 'history', label: `History (${customer.orders.history.length})` }
                ]}
                value={orderTab}
                onChange={setOrderTab}
                theme={theme}
              />
              <div className="mt-4 space-y-2">
                {(orderTab === 'current' ? customer.orders.current : customer.orders.history).length > 0 ? (
                  (orderTab === 'current' ? customer.orders.current : customer.orders.history).map(order => (
                    <OrderItem 
                      key={order.id} 
                      order={order} 
                      theme={theme}
                      onClick={() => onNavigate(`orders/${order.orderNumber}`)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: theme.colors.textSecondary }}>
                    No {orderTab} orders
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Approved Materials - SECOND */}
            <SectionCard title="Approved Materials" icon={FileText} theme={theme}>
              <ChipTabs 
                options={MATERIAL_CATEGORIES.filter(cat => {
                  const mats = customer.approvedMaterials[cat.key];
                  return mats && mats.length > 0;
                })}
                value={materialCategory}
                onChange={setMaterialCategory}
                theme={theme}
              />
              <div className="mt-3 space-y-1.5">
                {materials.length > 0 ? (
                  materials.map(mat => (
                    <SwatchItem key={mat.id} material={mat} theme={theme} />
                  ))
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: theme.colors.textSecondary }}>
                    No materials in this category
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Standards Programs & Contracts - THIRD - Reorganized with categories */}
            <SectionCard title="Standards Programs" icon={Shield} theme={theme}>
              {customer.standardsPrograms.length > 0 ? (
                <div className="space-y-4">
                  {/* Active Programs */}
                  {customer.standardsPrograms.filter(p => p.status === 'Active' && !p.poRequirementText).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.colors.textSecondary }}>
                        Programs
                      </p>
                      <div className="space-y-2">
                        {customer.standardsPrograms.filter(p => p.status === 'Active' && !p.poRequirementText).map(program => (
                          <button
                            key={program.id}
                            onClick={() => setSelectedProgramId(program.id)}
                            className="w-full text-left p-3 rounded-xl transition-colors hover:bg-black/5"
                            style={{ backgroundColor: theme.colors.subtle }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CodeChip code={program.code} theme={theme} />
                                  <StatusBadge status={program.status} size="sm" />
                                </div>
                                <p className="font-medium text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                  {program.title}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contracts (programs with PO requirement) */}
                  {customer.standardsPrograms.filter(p => p.poRequirementText).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                        <FileCheck className="w-3.5 h-3.5" />
                        Contracts
                      </p>
                      <div className="space-y-2">
                        {customer.standardsPrograms.filter(p => p.poRequirementText).map(program => (
                          <button
                            key={program.id}
                            onClick={() => setSelectedProgramId(program.id)}
                            className="w-full text-left p-3 rounded-xl transition-colors hover:bg-black/5"
                            style={{ 
                              backgroundColor: theme.colors.accent + '08',
                              border: `1px solid ${theme.colors.accent}20`
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CodeChip code={program.code} theme={theme} />
                                  <StatusBadge status={program.status} size="sm" />
                                </div>
                                <p className="font-medium text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                  {program.title}
                                </p>
                                <p className="text-[10px] mt-1 truncate" style={{ color: theme.colors.accent }}>
                                  {program.poRequirementText}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expiring/Expired Programs */}
                  {customer.standardsPrograms.filter(p => p.status === 'Expiring' || p.status === 'Expired').length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.colors.textSecondary }}>
                        Expiring / Expired
                      </p>
                      <div className="space-y-2">
                        {customer.standardsPrograms.filter(p => p.status === 'Expiring' || p.status === 'Expired').map(program => (
                          <button
                            key={program.id}
                            onClick={() => setSelectedProgramId(program.id)}
                            className="w-full text-left p-2.5 rounded-lg transition-colors hover:bg-black/5 opacity-75"
                            style={{ backgroundColor: theme.colors.subtle }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <CodeChip code={program.code} theme={theme} />
                                  <StatusBadge status={program.status} size="sm" />
                                </div>
                                <p className="font-medium text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                                  {program.title}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: theme.colors.textSecondary }}>
                  No standards programs or contracts on file
                </p>
              )}
            </SectionCard>

            {/* Typicals - Vision Casegood Configurations */}
            <TypicalsSection customerId={customerId} theme={theme} isDesktop={isDesktop} />

            {/* Install Gallery */}
            <SectionCard 
              title="Install Gallery" 
              icon={Image} 
              theme={theme}
              action={
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                >
                  <Plus className="w-3 h-3" /> Add Photos
                </button>
              }
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" />
              <ChipTabs 
                options={SPACE_TYPES.map(t => ({ key: t, label: t }))}
                value={photoFilter}
                onChange={setPhotoFilter}
                theme={theme}
              />
              <div className={`mt-4 grid gap-2 ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'}`}>
                {filteredPhotos.length > 0 ? (
                  filteredPhotos.map(photo => (
                    <button 
                      key={photo.id}
                      onClick={() => setLightboxPhoto(photo)}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-sm text-center py-4" style={{ color: theme.colors.textSecondary }}>
                    No photos in this category
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Documents */}
            {customer.documents.length > 0 && (
              <SectionCard title="Documents" icon={FileText} theme={theme}>
                <div className="space-y-2">
                  {customer.documents.map(doc => (
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

            {/* Contacts */}
            {customer.contacts.filter(c => c.visibility === 'dealer').length > 0 && (
              <SectionCard title="Contacts" icon={Users} theme={theme}>
                <div className="space-y-3">
                  {customer.contacts.filter(c => c.visibility === 'dealer').map(contact => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: theme.colors.subtle }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                        <Users className="w-5 h-5" style={{ color: theme.colors.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{contact.name}</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{contact.role}</p>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-xs" style={{ color: theme.colors.accent }}>{contact.email}</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Desktop Right Rail */}
          {isDesktop && (
            <div className="w-72 flex-shrink-0">
              <AtAGlanceCard />
            </div>
          )}
        </div>
      </div>

      {/* Request Update Modal */}
      <RequestUpdateModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        theme={theme}
        customerName={customer.name}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        theme={theme}
        customerName={customer.name}
        customerId={customerId}
      />

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightboxPhoto(null)}
        >
          <button 
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={lightboxPhoto.url} 
            alt={lightboxPhoto.caption || ''} 
            className="max-w-full max-h-[80vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightboxPhoto.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm">{lightboxPhoto.caption}</p>
              {lightboxPhoto.date && (
                <p className="text-white/60 text-xs mt-1">{new Date(lightboxPhoto.date).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Standards Program Detail Modal */}
      <StandardsProgramDetailModal
        isOpen={!!selectedProgramId}
        onClose={() => setSelectedProgramId(null)}
        customerId={customerId}
        programId={selectedProgramId}
        theme={theme}
      />
    </div>
  );
};

export default CustomerMicrositeScreen;
