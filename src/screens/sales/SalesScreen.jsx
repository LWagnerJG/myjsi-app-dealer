import React, { useMemo, useState, useCallback } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, BarChart, Table, Target, ChevronRight, Trophy, Award } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { motion } from 'framer-motion';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { JSI_COLORS, DESIGN_TOKENS } from '../../design-system/tokens.js';

const formatCompanyName = (name = '') => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// Navigation buttons - NOT toggles, just clickable cards that navigate
const NavigationButtons = ({ theme, onNavigate }) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={() => onNavigate('customer-rank')}
      className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
      style={{ 
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: DESIGN_TOKENS.shadows.sm
      }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${JSI_COLORS.gold}15` }}
      >
        <Trophy className="w-5 h-5" style={{ color: JSI_COLORS.gold }} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
          Customer Leaderboard
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
          Project rankings
        </p>
      </div>
      <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
    </button>
    
    <button
      onClick={() => onNavigate('incentive-rewards')}
      className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
      style={{ 
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: DESIGN_TOKENS.shadows.sm
      }}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${theme.colors.accent}15` }}
      >
        <Award className="w-5 h-5" style={{ color: theme.colors.accent }} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
          Sales Rewards
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
          Incentive programs
        </p>
      </div>
      <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
    </button>
  </div>
);

// Improved Monthly Bar Chart with better styling
const MonthlyBarChart = ({ data, theme, onMonthSelect, dataType = 'bookings' }) => {
  const max = Math.max(...data.map(d => dataType === 'bookings' ? d.bookings : d.sales));
  
  return (
    <div className="space-y-3">
      {data.map((m, idx) => {
        const val = dataType === 'bookings' ? m.bookings : m.sales;
        const pct = Math.min(99.4, (val / max) * 100);
        const isCurrentMonth = new Date().toLocaleString('en-US', { month: 'short' }) === m.month;
        
        return (
          <button
            key={m.month}
            onClick={() => onMonthSelect(m)}
            className="w-full grid grid-cols-[3rem,1fr,auto] items-center gap-x-4 text-sm py-1.5 rounded-lg transition-all hover:bg-black/[0.03] active:scale-[0.99] group"
          >
            <span 
              className="font-semibold text-left" 
              style={{ 
                color: isCurrentMonth ? theme.colors.accent : theme.colors.textSecondary,
                fontWeight: isCurrentMonth ? 700 : 500
              }}
            >
              {m.month}
            </span>
            <div 
              className="h-4 rounded-full relative overflow-hidden" 
              style={{ backgroundColor: `${theme.colors.border}60` }}
            >
              <motion.div 
                className="absolute inset-y-0 left-0 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: pct + '%' }} 
                transition={{ duration: 0.5, delay: idx * 0.03, ease: [0.4, 0, 0.2, 1] }} 
                style={{ 
                  backgroundColor: isCurrentMonth ? theme.colors.accent : `${theme.colors.accent}90`
                }} 
              />
            </div>
            <span 
              className="font-semibold text-right min-w-[5.5rem] group-hover:text-opacity-80 transition-colors" 
              style={{ color: theme.colors.textPrimary }}
            >
              ${val.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Table view for monthly data
const MonthlyTable = ({ data, theme, onMonthSelect }) => (
  <div className="text-sm overflow-hidden rounded-xl" style={{ border: `1px solid ${theme.colors.border}` }}>
    <div 
      className="grid grid-cols-3 font-bold text-[11px] uppercase tracking-wider" 
      style={{ 
        backgroundColor: `${theme.colors.subtle}50`,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="p-3" style={{ color: theme.colors.textSecondary }}>Month</div>
      <div className="p-3 text-right" style={{ color: theme.colors.textSecondary }}>Bookings</div>
      <div className="p-3 text-right" style={{ color: theme.colors.textSecondary }}>Sales</div>
    </div>
    {data.map((m, i) => (
      <div 
        key={m.month} 
        className="grid grid-cols-3 cursor-pointer hover:bg-black/[0.03] transition-colors" 
        style={{ borderBottom: i < data.length - 1 ? `1px solid ${theme.colors.border}30` : 'none' }}
        onClick={() => onMonthSelect(m)}
      >
        <div className="p-3 font-semibold" style={{ color: theme.colors.textPrimary }}>{m.month}</div>
        <div className="p-3 text-right font-medium" style={{ color: theme.colors.textPrimary }}>${m.bookings.toLocaleString()}</div>
        <div className="p-3 text-right font-medium" style={{ color: theme.colors.textPrimary }}>${m.sales.toLocaleString()}</div>
      </div>
    ))}
  </div>
);

// Customer breakdown for selected month
const CustomerMonthlyBreakdown = ({ monthData, orders, theme, onBack }) => {
  const monthlyOrders = useMemo(() => {
    const num = monthNameToNumber[monthData.month];
    if (num === undefined) return [];
    return orders.filter(o => new Date(o.date).getMonth() === num);
  }, [monthData, orders]);
  
  const customerData = useMemo(() => {
    const map = {};
    monthlyOrders.forEach(o => {
      if (!map[o.company]) map[o.company] = { company: o.company, bookings: 0, orders: 0 };
      map[o.company].bookings += o.net;
      map[o.company].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.bookings - a.bookings);
  }, [monthlyOrders]);
  
  const total = customerData.reduce((sum, c) => sum + c.bookings, 0);
  
  return (
    <div>
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm font-semibold mb-5 px-3 py-2 rounded-full transition-all hover:bg-black/[0.05]" 
        style={{ color: theme.colors.accent }}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to Overview
      </button>
      
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
          {monthData.month} Breakdown
        </h4>
        <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
          ${total.toLocaleString()}
        </span>
      </div>
      
      <div className="space-y-2">
        {customerData.map((c, i) => {
          const pct = (c.bookings / total) * 100;
          return (
            <div 
              key={c.company} 
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-black/[0.03]"
              style={{ backgroundColor: i === 0 ? `${theme.colors.accent}08` : 'transparent' }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ 
                  backgroundColor: i === 0 ? theme.colors.accent : theme.colors.subtle,
                  color: i === 0 ? '#FFF' : theme.colors.textSecondary
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                  {formatCompanyName(c.company)}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {c.orders} order{c.orders !== 1 ? 's' : ''} • {pct.toFixed(1)}%
                </p>
              </div>
              <span className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                ${c.bookings.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Order detail modal
const OrderModal = ({ order, onClose, theme }) => {
  if (!order) return null;
  return (
    <Modal show={!!order} onClose={onClose} title={`PO #${order.po}`} theme={theme}>
      <div className="space-y-4 text-sm" style={{ color: theme.colors.textPrimary }}>
        <div>
          <h3 className="font-bold">{formatCompanyName(order.company)}</h3>
          <p style={{ color: theme.colors.textSecondary }}>{order.details}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Order Date</div>
            <div>{new Date(order.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Ship Date</div>
            <div>{new Date(order.shipDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Net Amount</div>
            <div className="font-bold" style={{ color: theme.colors.accent }}>${order.net.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Status</div>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded-full" 
              style={{ 
                backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '20', 
                color: STATUS_COLORS[order.status] || theme.colors.secondary 
              }}
            >
              {order.status}
            </span>
          </div>
        </div>
        {order.lineItems?.length > 0 && (
          <div>
            <h4 className="font-bold border-t pt-3 mt-3" style={{ borderColor: theme.colors.subtle }}>Line Items</h4>
            <div className="space-y-2 mt-2">
              {order.lineItems.map(li => (
                <div key={li.line} className="flex justify-between">
                  <span>{li.quantity}x {li.name}</span>
                  <span className="font-semibold">${li.extNet.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Compact Progress to Goal component
const ProgressToGoalCompact = ({ theme, totalBookings, goal, percentToGoal, aheadOfPace, deltaLabel }) => {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ 
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: DESIGN_TOKENS.shadows.sm
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${theme.colors.accent}12` }}
      >
        <Target className="w-6 h-6" style={{ color: theme.colors.accent }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
            Progress to Goal
          </span>
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
            style={aheadOfPace 
              ? { background: '#34D39920', color: '#059669' } 
              : { background: '#F8717120', color: '#DC2626' }
            }
          >
            {aheadOfPace ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
            {deltaLabel}
          </span>
        </div>
        
        <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.border }}>
          <motion.div 
            className="h-full rounded-full" 
            initial={{ width: 0 }} 
            animate={{ width: percentToGoal + '%' }} 
            transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 22 }} 
            style={{ backgroundColor: theme.colors.accent }} 
          />
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-bold leading-none" style={{ color: theme.colors.textPrimary }}>
          {percentToGoal.toFixed(1)}%
        </p>
        <p className="text-[10px] font-medium mt-0.5" style={{ color: theme.colors.textSecondary }}>
          ${(totalBookings / 1000000).toFixed(1)}M / ${(goal / 1000000).toFixed(0)}M
        </p>
      </div>
    </div>
  );
};

export const SalesScreen = ({ theme, onNavigate }) => {
  const [monthlyView, setMonthlyView] = useState('chart');
  const [chartDataType, setChartDataType] = useState('bookings');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [numRecentOrders, setNumRecentOrders] = useState(3);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const { totalBookings, totalSales } = useMemo(() => ({
    totalBookings: MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0),
    totalSales: MONTHLY_SALES_DATA.reduce((a, m) => a + m.sales, 0)
  }), []);

  const { percentToGoal, deltaLabel, aheadOfPace } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const next = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (next - start) / 86400000;
    const dayOfYear = Math.floor((now - start) / 86400000) + 1;
    const yearPct = (dayOfYear / totalDays) * 100;
    const goalPct = (MONTHLY_SALES_DATA.reduce((a, m) => a + m.bookings, 0) / 7000000) * 100;
    const delta = goalPct - yearPct;
    return { 
      percentToGoal: goalPct, 
      deltaLabel: `${Math.abs(delta).toFixed(1)}%`, 
      aheadOfPace: delta >= 0 
    };
  }, []);

  const salesByVertical = useMemo(() => (
    SALES_VERTICALS_DATA?.length 
      ? SALES_VERTICALS_DATA.map(v => ({ name: v.label || v.vertical, value: v.value, color: v.color })) 
      : []
  ), []);
  
  const allRecentOrders = useMemo(() => 
    ORDER_DATA.filter(o => o.date && o.net).sort((a, b) => new Date(b.date) - new Date(a.date)), 
  []);
  
  const displayedRecent = useMemo(() => allRecentOrders.slice(0, numRecentOrders), [allRecentOrders, numRecentOrders]);
  const goal = 7000000;

  const showMoreOrders = () => setNumRecentOrders(n => Math.min(allRecentOrders.length, n === 3 ? 8 : n + 5));

  return (
    <ScreenLayout
      theme={theme}
      maxWidth="content"
      padding={true}
      paddingBottom="8rem"
    >
      {/* Navigation Buttons - Customer Leaderboard & Sales Rewards */}
      <NavigationButtons theme={theme} onNavigate={onNavigate} />

      {/* Primary: Monthly Performance Chart */}
      <GlassCard theme={theme} className="p-5" variant="elevated">
        {selectedMonth ? (
          <CustomerMonthlyBreakdown 
            monthData={selectedMonth} 
            orders={ORDER_DATA} 
            theme={theme} 
            onBack={() => setSelectedMonth(null)} 
          />
        ) : (
          <>
            {/* Header with toggle and view switch */}
            <div className="flex items-center justify-between mb-5">
              <div 
                className="inline-flex items-center rounded-full p-1 gap-1" 
                style={{ 
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <button 
                  onClick={() => setChartDataType('bookings')} 
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                  style={{ 
                    backgroundColor: chartDataType === 'bookings' ? theme.colors.accent : 'transparent', 
                    color: chartDataType === 'bookings' ? '#FFF' : theme.colors.textSecondary,
                    boxShadow: chartDataType === 'bookings' ? DESIGN_TOKENS.shadows.sm : 'none'
                  }}
                >
                  Bookings
                </button>
                <button 
                  onClick={() => setChartDataType('sales')} 
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                  style={{ 
                    backgroundColor: chartDataType === 'sales' ? theme.colors.accent : 'transparent', 
                    color: chartDataType === 'sales' ? '#FFF' : theme.colors.textSecondary,
                    boxShadow: chartDataType === 'sales' ? DESIGN_TOKENS.shadows.sm : 'none'
                  }}
                >
                  Sales
                </button>
              </div>
              
              <button 
                onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95" 
                style={{ 
                  backgroundColor: theme.colors.surface, 
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: DESIGN_TOKENS.shadows.sm
                }}
                aria-label={monthlyView === 'chart' ? 'Show table view' : 'Show chart view'}
              >
                {monthlyView === 'chart' 
                  ? <Table className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /> 
                  : <BarChart className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                }
              </button>
            </div>
            
            {/* Chart or Table */}
            {monthlyView === 'chart' 
              ? <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} dataType={chartDataType} /> 
              : <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} />
            }
            
            {/* Total summary */}
            <div 
              className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: `1px solid ${theme.colors.border}30` }}
            >
              <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                Total {chartDataType === 'bookings' ? 'Bookings' : 'Sales'}
              </span>
              <span className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                ${(chartDataType === 'bookings' ? totalBookings : totalSales).toLocaleString()}
              </span>
            </div>
          </>
        )}
      </GlassCard>

      {/* Progress to Goal - Compact version below chart */}
      <ProgressToGoalCompact 
        theme={theme}
        totalBookings={totalBookings}
        goal={goal}
        percentToGoal={percentToGoal}
        aheadOfPace={aheadOfPace}
        deltaLabel={deltaLabel}
      />

      {/* Recent Orders */}
      <GlassCard theme={theme} className="p-5" variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
            Recent Orders
          </h3>
          <button 
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold flex items-center gap-1 transition-all hover:opacity-80"
            style={{ color: theme.colors.accent }}
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="space-y-1">
          {displayedRecent.map((order, i) => (
            <motion.button
              key={order.orderNumber}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl transition-all hover:bg-black/[0.03] active:scale-[0.99] text-left"
              onClick={() => setSelectedOrder(order)}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.colors.accent}10` }}
              >
                <span className="text-xs font-bold" style={{ color: theme.colors.accent }}>
                  {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).split(' ')[1]}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                  {formatCompanyName(order.company)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span 
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase"
                    style={{ 
                      backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '15', 
                      color: STATUS_COLORS[order.status] || theme.colors.secondary 
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              
              <span className="font-bold text-sm flex-shrink-0" style={{ color: theme.colors.textPrimary }}>
                ${order.net.toLocaleString()}
              </span>
            </motion.button>
          ))}
        </div>
        
        {numRecentOrders < allRecentOrders.length && (
          <button 
            onClick={showMoreOrders} 
            className="w-full text-center text-xs font-semibold mt-3 py-3 rounded-xl transition-all hover:bg-black/[0.03]" 
            style={{ color: theme.colors.accent }}
          >
            Show More Orders
          </button>
        )}
      </GlassCard>

      {/* Sales by Vertical */}
      {salesByVertical.length > 0 && (
        <GlassCard theme={theme} className="p-5" variant="elevated">
          <h3 className="font-bold text-base mb-4" style={{ color: theme.colors.textPrimary }}>
            Sales by Vertical (YTD)
          </h3>
          <SalesByVerticalBreakdown 
            data={salesByVertical} 
            theme={theme} 
            showOverview 
            palette={['#55A868', '#C44E52', '#8172B2', '#CCB04C', '#4C72B0', '#8C8C8C']} 
          />
        </GlassCard>
      )}

      {/* Order detail modal */}
      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
    </ScreenLayout>
  );
};
