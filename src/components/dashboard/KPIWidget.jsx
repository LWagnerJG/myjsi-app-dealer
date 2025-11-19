import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Package } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
import { AnimatedCurrency, AnimatedPercentage, AnimatedNumber } from '../common/AnimatedNumber.jsx';

export const KPIWidget = ({ theme, opportunities = [], orders = [], customerDirectory = [] }) => {
  const kpis = useMemo(() => {
    // Calculate average deal size
    const activeOpps = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost');
    const avgDealSize = activeOpps.length > 0 
      ? activeOpps.reduce((sum, o) => {
          const val = typeof o.value === 'string' 
            ? parseFloat(o.value.replace(/[^0-9.]/g, '')) || 0
            : o.value || 0;
          return sum + val;
        }, 0) / activeOpps.length
      : 0;
    
    // Calculate win rate
    const closedOpps = opportunities.filter(o => o.stage === 'Won' || o.stage === 'Lost');
    const wonCount = closedOpps.filter(o => o.stage === 'Won').length;
    const winRate = closedOpps.length > 0 ? (wonCount / closedOpps.length * 100) : 0;
    
    // Orders per customer (velocity)
    const avgOrdersPerCustomer = customerDirectory.length > 0
      ? orders.length / customerDirectory.length
      : 0;
    
    // Average order value
    const avgOrderValue = orders.length > 0
      ? orders.reduce((sum, o) => sum + (o.net || 0), 0) / orders.length
      : 0;
    
    return [
      {
        label: 'Avg Deal Size',
        value: avgDealSize,
        format: 'currency',
        icon: DollarSign,
        trend: avgDealSize > 50000 ? 'up' : 'neutral',
        color: '#3B82F6'
      },
      {
        label: 'Win Rate',
        value: winRate,
        format: 'percentage',
        icon: Target,
        trend: winRate > 50 ? 'up' : winRate > 30 ? 'neutral' : 'down',
        color: '#10B981'
      },
      {
        label: 'Customer Velocity',
        value: avgOrdersPerCustomer,
        format: 'number',
        suffix: ' orders/cust',
        icon: Users,
        trend: avgOrdersPerCustomer > 2 ? 'up' : 'neutral',
        color: '#8B5CF6'
      },
      {
        label: 'Avg Order Value',
        value: avgOrderValue,
        format: 'currency',
        icon: Package,
        trend: avgOrderValue > 20000 ? 'up' : 'neutral',
        color: '#F59E0B'
      }
    ];
  }, [opportunities, orders, customerDirectory]);

  return (
    <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
      <h3 className="font-bold text-base mb-4" style={{ color: theme.colors.textPrimary }}>
        Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="p-3 rounded-xl" 
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              {kpi.trend === 'up' && (
                <TrendingUp className="w-3 h-3" style={{ color: '#10B981' }} />
              )}
              {kpi.trend === 'down' && (
                <TrendingDown className="w-3 h-3" style={{ color: '#EF4444' }} />
              )}
            </div>
            <p className="text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
              {kpi.label}
            </p>
            <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
              {kpi.format === 'currency' && (
                <AnimatedCurrency value={kpi.value} duration={800} />
              )}
              {kpi.format === 'percentage' && (
                <AnimatedPercentage value={kpi.value} duration={800} decimals={0} />
              )}
              {kpi.format === 'number' && (
                <>
                  <AnimatedNumber value={kpi.value} duration={800} decimals={1} />
                  {kpi.suffix && <span className="text-xs">{kpi.suffix}</span>}
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
