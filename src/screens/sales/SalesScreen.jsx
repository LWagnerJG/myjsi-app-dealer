import React, { useMemo, useState, useCallback } from 'react';
import { Modal } from '../../components/common/Modal';
import { ArrowUp, ArrowDown, BarChart3, Table2, Target, ChevronRight, Trophy, Award } from 'lucide-react';
import { MONTHLY_SALES_DATA, SALES_VERTICALS_DATA } from './data.js';
import { ORDER_DATA, STATUS_COLORS } from '../orders/data.js';
import { SalesByVerticalBreakdown } from './components/SalesByVerticalBreakdown.jsx';
import { motion } from 'framer-motion';
import { GlassCard, ScreenLayout } from '../../design-system/index.js';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

const formatCompanyName = (name = '') => name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const monthNameToNumber = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// Monthly Bar Chart - shows one metric at a time with toggle
const MonthlyBarChart = ({ data, theme, onMonthSelect, dataType = 'bookings' }) => {
  const max = Math.max(...data.map(d => dataType === 'bookings' ? d.bookings : d.sales));
  const label = dataType === 'bookings' ? 'Ordered' : 'Invoiced';
  
  return (
    <div className="space-y-2.5">
      {data.map((m, idx) => {
        const val = dataType === 'bookings' ? m.bookings : m.sales;
        const pct = Math.min(99, (val / max) * 100);
        const isCurrentMonth = new Date().toLocaleString('en-US', { month: 'short' }) === m.month;
        
        return (
          <button
            key={m.month}
            onClick={() => onMonthSelect(m)}
            className="w-full grid grid-cols-[2.5rem,1fr,auto] items-center gap-3 py-1 rounded-lg transition-all hover:bg-black/[0.02] active:scale-[0.995]"
          >
            <span 
              className="text-[13px] font-medium text-left" 
              style={{ 
                color: isCurrentMonth ? theme.colors.accent : theme.colors.textSecondary
              }}
            >
              {m.month}
            </span>
            <div 
              className="h-3 rounded-full relative overflow-hidden" 
              style={{ backgroundColor: theme.colors.subtle }}
            >
              <motion.div 
                className="absolute inset-y-0 left-0 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: pct + '%' }} 
                transition={{ duration: 0.4, delay: idx * 0.02, ease: [0.4, 0, 0.2, 1] }} 
                style={{ backgroundColor: theme.colors.accent }} 
              />
            </div>
            <span 
              className="text-[13px] font-semibold text-right min-w-[5rem] tabular-nums" 
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

// Table view - shows both Ordered and Invoiced columns
const MonthlyTable = ({ data, theme, onMonthSelect }) => (
  <div className="text-[13px] overflow-hidden rounded-xl" style={{ border: `1px solid ${theme.colors.border}` }}>
    <div 
      className="grid grid-cols-3 font-semibold text-[11px] uppercase tracking-wider" 
      style={{ 
        backgroundColor: theme.colors.subtle,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="px-3 py-2.5" style={{ color: theme.colors.textSecondary }}>Month</div>
      <div className="px-3 py-2.5 text-right" style={{ color: theme.colors.textSecondary }}>Ordered</div>
      <div className="px-3 py-2.5 text-right" style={{ color: theme.colors.textSecondary }}>Invoiced</div>
    </div>
    {data.map((m, i) => (
      <button 
        key={m.month} 
        className="w-full grid grid-cols-3 text-left hover:bg-black/[0.02] transition-colors" 
        style={{ borderBottom: i < data.length - 1 ? `1px solid ${theme.colors.border}20` : 'none' }}
        onClick={() => onMonthSelect(m)}
      >
        <div className="px-3 py-2.5 font-medium" style={{ color: theme.colors.textPrimary }}>{m.month}</div>
        <div className="px-3 py-2.5 text-right tabular-nums" style={{ color: theme.colors.textPrimary }}>${m.bookings.toLocaleString()}</div>
        <div className="px-3 py-2.5 text-right tabular-nums" style={{ color: theme.colors.textPrimary }}>${m.sales.toLocaleString()}</div>
      </button>
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
        className="flex items-center gap-1.5 text-[13px] font-semibold mb-4 transition-all hover:opacity-70" 
        style={{ color: theme.colors.accent }}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>
      
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>
          {monthData.month} Breakdown
        </h4>
        <span className="text-[13px] font-medium tabular-nums" style={{ color: theme.colors.textSecondary }}>
          ${total.toLocaleString()}
        </span>
      </div>
      
      <div className="space-y-1">
        {customerData.map((c, i) => {
          const pct = (c.bookings / total) * 100;
          return (
            <div 
              key={c.company} 
              className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-black/[0.02]"
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ 
                  backgroundColor: i === 0 ? theme.colors.accent : theme.colors.subtle,
                  color: i === 0 ? '#FFF' : theme.colors.textSecondary
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px] truncate" style={{ color: theme.colors.textPrimary }}>
                  {formatCompanyName(c.company)}
                </p>
                <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  {c.orders} order{c.orders !== 1 ? 's' : ''} • {pct.toFixed(1)}%
                </p>
              </div>
              <span className="font-semibold text-[13px] tabular-nums" style={{ color: theme.colors.textPrimary }}>
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
      </div>
    </Modal>
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
      {/* Navigation Cards - Customer Leaderboard & Sales Rewards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('customer-rank')}
          className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
          style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.accent }} />
          <span className="font-semibold text-[13px]" style={{ color: theme.colors.textPrimary }}>
            Leaderboard
          </span>
          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
        </button>
        
        <button
          onClick={() => onNavigate('incentive-rewards')}
          className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
          style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Award className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.accent }} />
          <span className="font-semibold text-[13px]" style={{ color: theme.colors.textPrimary }}>
            Rewards
          </span>
          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
        </button>
      </div>

      {/* Monthly Performance Card with Progress to Goal inside */}
      <GlassCard theme={theme} className="p-4" variant="elevated">
        {selectedMonth ? (
          <CustomerMonthlyBreakdown 
            monthData={selectedMonth} 
            orders={ORDER_DATA} 
            theme={theme} 
            onBack={() => setSelectedMonth(null)} 
          />
        ) : (
          <>
            {/* Header: Total + Controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                  {monthlyView === 'chart' ? (chartDataType === 'bookings' ? 'Total Ordered' : 'Total Invoiced') : 'YTD Summary'}
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                  ${(monthlyView === 'chart' ? (chartDataType === 'bookings' ? totalBookings : totalSales) : totalBookings).toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle only shows in chart view */}
                {monthlyView === 'chart' && (
                  <div 
                    className="flex items-center rounded-full p-0.5" 
                    style={{ backgroundColor: theme.colors.subtle }}
                  >
                    <button 
                      onClick={() => setChartDataType('bookings')} 
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                      style={{ 
                        backgroundColor: chartDataType === 'bookings' ? '#FFF' : 'transparent', 
                        color: chartDataType === 'bookings' ? theme.colors.textPrimary : theme.colors.textSecondary,
                        boxShadow: chartDataType === 'bookings' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Ordered
                    </button>
                    <button 
                      onClick={() => setChartDataType('sales')} 
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                      style={{ 
                        backgroundColor: chartDataType === 'sales' ? '#FFF' : 'transparent', 
                        color: chartDataType === 'sales' ? theme.colors.textPrimary : theme.colors.textSecondary,
                        boxShadow: chartDataType === 'sales' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Invoiced
                    </button>
                  </div>
                )}
                
                {/* View toggle */}
                <button 
                  onClick={() => setMonthlyView(v => v === 'chart' ? 'table' : 'chart')} 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95" 
                  style={{ backgroundColor: theme.colors.subtle }}
                >
                  {monthlyView === 'chart' 
                    ? <Table2 className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /> 
                    : <BarChart3 className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                  }
                </button>
              </div>
            </div>
            
            {/* Chart or Table */}
            {monthlyView === 'chart' 
              ? <MonthlyBarChart data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} dataType={chartDataType} /> 
              : <MonthlyTable data={MONTHLY_SALES_DATA} theme={theme} onMonthSelect={setSelectedMonth} />
            }
            
            {/* Progress to Goal - inside the card */}
            <div 
              className="mt-4 pt-4 flex items-center gap-3"
              style={{ borderTop: `1px solid ${theme.colors.border}20` }}
            >
              <Target className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                    Progress to Goal
                  </span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                      style={aheadOfPace 
                        ? { background: '#34D39915', color: '#059669' } 
                        : { background: '#F8717115', color: '#DC2626' }
                      }
                    >
                      {aheadOfPace ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                      {deltaLabel}
                    </span>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                      {percentToGoal.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                  <motion.div 
                    className="h-full rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: percentToGoal + '%' }} 
                    transition={{ type: 'spring', stiffness: 140, damping: 22 }} 
                    style={{ backgroundColor: theme.colors.accent }} 
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </GlassCard>

      {/* Recent Orders */}
      <GlassCard theme={theme} className="p-4" variant="elevated">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[15px]" style={{ color: theme.colors.textPrimary }}>
            Recent Orders
          </h3>
          <button 
            onClick={() => onNavigate('orders')}
            className="text-[12px] font-semibold flex items-center gap-0.5 transition-all hover:opacity-70"
            style={{ color: theme.colors.accent }}
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="space-y-0.5">
          {displayedRecent.map((order, i) => (
            <motion.button
              key={order.orderNumber}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl transition-all hover:bg-black/[0.02] active:scale-[0.99] text-left"
              onClick={() => setSelectedOrder(order)}
            >
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.colors.subtle }}
              >
                <span className="text-[11px] font-bold" style={{ color: theme.colors.accent }}>
                  {new Date(order.date).getDate()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px] truncate" style={{ color: theme.colors.textPrimary }}>
                  {formatCompanyName(order.company)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span 
                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase"
                    style={{ 
                      backgroundColor: (STATUS_COLORS[order.status] || theme.colors.secondary) + '12', 
                      color: STATUS_COLORS[order.status] || theme.colors.secondary 
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              
              <span className="font-semibold text-[13px] tabular-nums flex-shrink-0" style={{ color: theme.colors.textPrimary }}>
                ${order.net.toLocaleString()}
              </span>
            </motion.button>
          ))}
        </div>
        
        {numRecentOrders < allRecentOrders.length && (
          <button 
            onClick={showMoreOrders} 
            className="w-full text-center text-[12px] font-semibold mt-2 py-2 rounded-xl transition-all hover:bg-black/[0.02]" 
            style={{ color: theme.colors.accent }}
          >
            Show More
          </button>
        )}
      </GlassCard>

      {/* Sales by Vertical */}
      {salesByVertical.length > 0 && (
        <GlassCard theme={theme} className="p-4" variant="elevated">
          <h3 className="font-semibold text-[15px] mb-3" style={{ color: theme.colors.textPrimary }}>
            Invoiced by Vertical
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
