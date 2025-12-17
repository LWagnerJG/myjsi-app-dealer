import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calendar, List, ChevronLeft, ChevronRight, Search, Package, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { Badge, ScreenLayout } from '../../design-system/index.js';
import { ORDER_DATA, STATUS_COLORS } from './data.js';
import { useIsDesktop } from '../../hooks/useResponsive.js';
import { DESIGN_TOKENS, JSI_COLORS, getCardShadow } from '../../design-system/index.js';

/* ---------------------------- Helpers ---------------------------- */
const formatTitleCase = (name = '') => name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const currency0 = (n = 0) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Simplified neutral status indicator - matches JSI design system
const StatusPill = ({ status, theme }) => {
  // Use neutral colors - only subtle distinction for active states
  const isActive = status === 'Shipping' || status === 'In Production';
  const bgColor = isActive ? `${JSI_COLORS.charcoal}08` : `${JSI_COLORS.charcoal}05`;
  const textColor = theme.colors.textSecondary;
  
  return (
    <Badge 
      variant="soft" 
      size="sm"
      theme={theme}
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
        border: 'none'
      }}
    >
      {status}
    </Badge>
  );
};

/* ---------------------- Calendar View ---------------------- */
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const ordersByDate = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => {
      const raw = o[dateType]; if (!raw) return; const d = new Date(raw); if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!m.has(key)) m.set(key, []); m.get(key).push(o);
    });
    return m;
  }, [orders, dateType]);

  const selectedOrders = useMemo(() => {
    if (!selectedDate) return []; const k = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`; return ordersByDate.get(k) || [];
  }, [selectedDate, ordersByDate]);

  const year = currentDate.getFullYear(); const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <GlassCard theme={theme} className="p-6" variant="elevated">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition">
            <ChevronLeft style={{ color: theme.colors.textSecondary }} />
          </button>
          <h3 className="font-bold text-lg tracking-tight" style={{ color: theme.colors.textPrimary }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 transition">
            <ChevronRight style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: theme.colors.textSecondary }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b-${i}`} />)}
          {days.map(day => {
            const date = new Date(year, month, day); 
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();
            const key = `${year}-${month}-${day}`; 
            const has = ordersByDate.has(key);
            const total = (ordersByDate.get(key) || []).reduce((s, o) => s + (o.net || 0), 0);
            
            return (
              <button 
                key={day} 
                onClick={() => setSelectedDate(date)} 
                className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 relative ${isSelected ? 'shadow-inner' : ''}`} 
                style={{ 
                  backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                  border: isToday ? `1.5px solid ${theme.colors.accent}40` : 'none'
                }}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? '#FFF' : theme.colors.textPrimary }}>{day}</span>
                {has && !isSelected && <span className="text-[9px] font-bold mt-0.5" style={{ color: theme.colors.accent }}>{currency0(total)}</span>}
                {has && isSelected && <span className="text-[9px] font-bold mt-0.5 text-white/80">{currency0(total)}</span>}
                {has && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? '#FFF' : theme.colors.accent }} />}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {selectedDate && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-base tracking-tight" style={{ color: theme.colors.textPrimary }}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedOrders.length} Orders</span>
          </div>
          
          {selectedOrders.length > 0 ? (
            <div className="space-y-3">
              {selectedOrders.map(o => (
                <GlassCard key={o.orderNumber} theme={theme} className="p-4 cursor-pointer flex items-center gap-4 active:scale-[0.99] transition-all" variant="elevated" onClick={() => onOrderClick(o)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.subtle }}>
                    <Package className="w-6 h-6" style={{ color: theme.colors.textSecondary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] truncate" style={{ color: theme.colors.textPrimary }}>{formatTitleCase(o.details)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>SO {o.orderNumber}</span>
                      <StatusPill status={o.status} theme={theme} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg" style={{ color: theme.colors.textPrimary }}>{currency0(o.net)}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-400">No orders for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------------- Grouped List Tile ---------------------- */
const GroupTile = React.memo(({ theme, dateKey, group, onNavigate }) => {
  const date = new Date(dateKey); date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hasMultipleOrders = group.orders.length > 1;
  
  return (
    <div className="mb-4 last:mb-0">
      <GlassCard theme={theme} className="overflow-hidden" variant="elevated" style={{ borderRadius: '24px' }}>
        {/* Date and Total Header - Inside the card */}
        <div 
          className="flex items-center justify-between px-5 py-3.5"
          style={{ 
            borderBottom: `1px solid ${theme.colors.border}40`,
            backgroundColor: theme.colors.subtle
          }}
        >
          <h2 
            className="font-semibold text-sm uppercase tracking-wider" 
            style={{ 
              color: theme.colors.textPrimary,
              fontFamily: DESIGN_TOKENS.typography.fontFamily
            }}
          >
            {label}
          </h2>
          {hasMultipleOrders && (
            <div className="flex items-center gap-2">
              <span 
                className="text-[11px] font-medium uppercase tracking-wider" 
                style={{ color: theme.colors.textSecondary }}
              >
                Total:
              </span>
              <p 
                className="font-bold text-base" 
                style={{ color: theme.colors.textPrimary }}
              >
                {currency0(group.total)}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {group.orders.map((o, idx) => {
            const showDivider = idx < group.orders.length - 1;
            return (
              <React.Fragment key={o.orderNumber}>
                <button 
                  onClick={() => onNavigate(`orders/${o.orderNumber}`)} 
                  className="w-full text-left p-4 rounded-2xl hover:bg-black/5 active:scale-[0.99] transition-all group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105" style={{ backgroundColor: theme.colors.subtle }}>
                    <Package className="w-6 h-6" style={{ color: theme.colors.textSecondary }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-[15px] truncate leading-tight" style={{ color: theme.colors.textPrimary }}>{formatTitleCase(o.details)}</p>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>SO {o.orderNumber}</span>
                      <StatusPill status={o.status} theme={theme} />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-black text-[17px] leading-tight" style={{ color: theme.colors.textPrimary }}>{currency0(o.net)}</p>
                  </div>
                </button>
                {showDivider && <div className="h-[1px] mx-4 bg-gray-50" />}
              </React.Fragment>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
});
GroupTile.displayName = 'GroupTile';

/* --------------------------- Main Screen --------------------------- */
export const OrdersScreen = ({ theme, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateType, setDateType] = useState('shipDate');
  const [viewMode, setViewMode] = useState('list');
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef(null);
  const isDesktop = useIsDesktop();

  const handleScroll = useCallback(() => { if (scrollRef.current) setIsScrolled(scrollRef.current.scrollTop > 10); }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return ORDER_DATA.filter(o => (
      (o.details?.toLowerCase() || '').includes(term) ||
      (o.orderNumber?.toLowerCase() || '').includes(term) ||
      (o.company?.toLowerCase() || '').includes(term)
    ));
  }, [searchTerm]);

  const grouped = useMemo(() => filtered.reduce((acc, o) => { const raw = o[dateType]; if (!raw) return acc; const d = new Date(raw); if (isNaN(d)) return acc; const key = d.toISOString().split('T')[0]; if (!acc[key]) acc[key] = { orders: [], total: 0 }; acc[key].orders.push(o); acc[key].total += o.net || 0; return acc; }, {}), [filtered, dateType]);
  const groupKeys = useMemo(() => Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)), [grouped]);

  // Date toggle options
  const dateOptions = [
    { key: 'shipDate', label: 'Ship Date' },
    { key: 'date', label: 'PO Date' },
  ];

  const header = ({ isScrolled }) => (
    <div className="py-4 flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3 h-12">
        <div className="flex-1">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search orders, customers, POs..." 
            theme={theme} 
            variant="header" 
          />
        </div>
        <button 
          onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')} 
          className="h-12 w-12 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-sm border border-gray-100 flex-shrink-0" 
          style={{ backgroundColor: theme.colors.surface }}
          title={viewMode === 'list' ? 'Calendar View' : 'List View'}
        >
          {viewMode === 'list' ? <Calendar className="w-5 h-5 text-black" /> : <List className="w-5 h-5 text-black" />}
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        {/* Date Type Toggle - Switch style, not sequential */}
        <div className="flex items-center gap-3">
          <span 
            className="text-[11px] font-medium uppercase tracking-wider whitespace-nowrap" 
            style={{ color: theme.colors.textSecondary }}
          >
            View by:
          </span>
          <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1" style={{ backgroundColor: theme.colors.subtle }}>
            <button
              onClick={() => setDateType('shipDate')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                dateType === 'shipDate' 
                  ? 'bg-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                backgroundColor: dateType === 'shipDate' ? theme.colors.surface : 'transparent',
                color: dateType === 'shipDate' ? theme.colors.textPrimary : theme.colors.textSecondary,
                boxShadow: dateType === 'shipDate' ? DESIGN_TOKENS.shadows.sm : 'none'
              }}
            >
              Ship Date
            </button>
            <button
              onClick={() => setDateType('date')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                dateType === 'date' 
                  ? 'bg-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                backgroundColor: dateType === 'date' ? theme.colors.surface : 'transparent',
                color: dateType === 'date' ? theme.colors.textPrimary : theme.colors.textSecondary,
                boxShadow: dateType === 'date' ? DESIGN_TOKENS.shadows.sm : 'none'
              }}
            >
              PO Date
            </button>
          </div>
        </div>
        {isDesktop && (
            <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Total Results</p>
                <p className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>{filtered.length}</p>
            </div>
        )}
      </div>
    </div>
  );

  return (
    <ScreenLayout
      theme={theme}
      header={header}
      maxWidth="content"
      padding={true}
      paddingBottom="8rem"
    >
      {viewMode === 'list' ? (
        groupKeys.length ? (
          <div className="space-y-2">
            {groupKeys.map(k => <GroupTile key={k} theme={theme} dateKey={k} group={grouped[k]} onNavigate={onNavigate} />)}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-lg text-black">No orders found</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )
      ) : (
        <OrderCalendarView orders={filtered} theme={theme} dateType={dateType} onOrderClick={o => onNavigate(`orders/${o.orderNumber}`)} />
      )}
    </ScreenLayout>
  );
};
