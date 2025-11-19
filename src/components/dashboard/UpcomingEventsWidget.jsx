import React, { useMemo } from 'react';
import { Calendar, Package, Briefcase, ArrowRight } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
import { motion } from 'framer-motion';

export const UpcomingEventsWidget = ({ theme, opportunities = [], orders = [], onNavigate }) => {
  const events = useMemo(() => {
    const items = [];
    const now = new Date();
    
    // Orders shipping soon
    orders
      .filter(o => o.shipDate)
      .map(o => ({ ...o, shipDateObj: new Date(o.shipDate) }))
      .filter(o => o.shipDateObj > now)
      .sort((a, b) => a.shipDateObj - b.shipDateObj)
      .slice(0, 3)
      .forEach(order => {
        const daysUntil = Math.ceil((order.shipDateObj - now) / (1000 * 60 * 60 * 24));
        items.push({
          type: 'shipment',
          icon: Package,
          title: `Order #${order.orderNumber} ships`,
          subtitle: order.details || order.company || 'Order',
          date: order.shipDateObj,
          dateLabel: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`,
          action: () => onNavigate(`orders/${order.orderNumber}`),
          color: '#3B82F6'
        });
      });
    
    // PO expected opportunities
    opportunities
      .filter(o => o.poTimeframe && o.stage !== 'Won' && o.stage !== 'Lost')
      .filter(o => ['Within 30 Days', '30-60 Days'].includes(o.poTimeframe))
      .slice(0, 2)
      .forEach(opp => {
        const estimatedDays = opp.poTimeframe === 'Within 30 Days' ? 15 : 45;
        items.push({
          type: 'opportunity',
          icon: Briefcase,
          title: `PO expected: ${opp.name || opp.project || 'Untitled'}`,
          subtitle: `${opp.customer || opp.company || 'Unknown'} - ${opp.value || '$0'}`,
          date: new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000),
          dateLabel: opp.poTimeframe === 'Within 30 Days' ? '~2 weeks' : '~6 weeks',
          action: () => onNavigate('projects'),
          color: '#10B981'
        });
      });
    
    return items.sort((a, b) => a.date - b.date).slice(0, 5);
  }, [opportunities, orders, onNavigate]);

  if (events.length === 0) return null;

  return (
    <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
          <Calendar className="w-5 h-5" style={{ color: theme.colors.accent }} />
          Upcoming
        </h3>
        <button 
          onClick={() => onNavigate('orders')}
          className="text-xs font-semibold flex items-center gap-1" 
          style={{ color: theme.colors.accent }}
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-2">
        {events.map((event, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={event.action}
            className="w-full text-left p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <div className="w-12 text-center flex-shrink-0">
              <p className="text-xs font-semibold" style={{ color: event.color }}>
                {event.dateLabel}
              </p>
              <event.icon className="w-4 h-4 mx-auto mt-1" style={{ color: event.color }} />
            </div>
            <div 
              className="flex-1 min-w-0 border-l pl-3" 
              style={{ borderColor: theme.colors.border }}
            >
              <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>
                {event.title}
              </p>
              <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                {event.subtitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
};
