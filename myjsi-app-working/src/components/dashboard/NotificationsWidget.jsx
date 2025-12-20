import React, { useMemo } from 'react';
import { Bell, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationsWidget = ({ theme, opportunities = [], orders = [], customerDirectory = [] }) => {
  const notifications = useMemo(() => {
    const items = [];
    
    // Large opportunities close to decision
    opportunities
      .filter(o => o.stage === 'Decision/Bidding' || o.stage === 'PO Expected')
      .forEach(opp => {
        const value = typeof opp.value === 'string' 
          ? parseFloat(opp.value.replace(/[^0-9.]/g, '')) || 0
          : opp.value || 0;
        
        if (value > 50000) { // Large deals
          items.push({
            id: `opp-${opp.id}`,
            type: 'important',
            icon: TrendingUp,
            title: 'Large opportunity closing',
            message: `${opp.name || opp.project || 'Untitled'} ($${value.toLocaleString()}) in ${opp.stage}`,
            time: '2h ago',
            color: '#10B981'
          });
        }
      });
    
    // Orders pending acknowledgment
    const pendingOrders = orders.filter(o => o.status === 'Order Entry').length;
    if (pendingOrders > 0) {
      items.push({
        id: 'pending-orders',
        type: 'warning',
        icon: AlertTriangle,
        title: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} pending`,
        message: 'Requires acknowledgment',
        time: 'Now',
        color: '#F59E0B'
      });
    }
    
    // Win rate trending
    const recentOpps = opportunities.filter(o => o.stage === 'Won' || o.stage === 'Lost');
    const wonCount = recentOpps.filter(o => o.stage === 'Won').length;
    const winRate = recentOpps.length > 0 ? (wonCount / recentOpps.length * 100) : 0;
    
    if (winRate > 60 && recentOpps.length >= 5) {
      items.push({
        id: 'win-rate',
        type: 'success',
        icon: TrendingUp,
        title: 'Strong win rate!',
        message: `${winRate.toFixed(0)}% of recent projects won`,
        time: 'Today',
        color: '#10B981'
      });
    }
    
    // Customers with high activity
    customerDirectory
      .filter(c => (c.projects?.length || 0) >= 3)
      .slice(0, 1)
      .forEach(customer => {
        items.push({
          id: `customer-${customer.id}`,
          type: 'info',
          icon: Info,
          title: 'Active customer',
          message: `${customer.name} has ${customer.projects.length} active projects`,
          time: 'Today',
          color: '#3B82F6'
        });
      });
    
    return items.slice(0, 4);
  }, [opportunities, orders, customerDirectory]);

  if (notifications.length === 0) return null;

  return (
    <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
          <Bell className="w-5 h-5" style={{ color: theme.colors.accent }} />
          Notifications
        </h3>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl flex items-start gap-3"
              style={{ backgroundColor: `${notif.color}10` }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${notif.color}20` }}
              >
                <notif.icon className="w-4 h-4" style={{ color: notif.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5" style={{ color: theme.colors.textPrimary }}>
                  {notif.title}
                </p>
                <p className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                  {notif.message}
                </p>
                <span className="text-[10px] font-medium" style={{ color: notif.color }}>
                  {notif.time}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
