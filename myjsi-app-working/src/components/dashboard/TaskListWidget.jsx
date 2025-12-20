import React, { useMemo } from 'react';
import { Clock, AlertCircle, Info } from 'lucide-react';
import { GlassCard } from '../common/GlassCard.jsx';
import { motion } from 'framer-motion';

export const TaskListWidget = ({ theme, opportunities = [], orders = [], onNavigate }) => {
  const tasks = useMemo(() => {
    const items = [];
    
    // Opportunities expiring soon (high priority)
    opportunities
      .filter(opp => opp.poTimeframe && opp.stage !== 'Won' && opp.stage !== 'Lost')
      .filter(opp => ['Within 30 Days', '30-60 Days'].includes(opp.poTimeframe))
      .forEach(opp => {
        items.push({
          type: 'deadline',
          priority: opp.poTimeframe === 'Within 30 Days' ? 'high' : 'medium',
          title: `Follow up: ${opp.name || opp.project || 'Untitled'}`,
          subtitle: `Expected PO: ${opp.poTimeframe}`,
          action: () => onNavigate('projects'),
          dueDate: opp.poTimeframe === 'Within 30 Days' ? 'Urgent' : 'Soon'
        });
      });
    
    // Orders needing attention (acknowledged but not in production)
    orders
      .filter(order => order.status === 'Acknowledged' || order.status === 'Order Entry')
      .slice(0, 3)
      .forEach(order => {
        items.push({
          type: 'action',
          priority: 'medium',
          title: `Process order #${order.orderNumber}`,
          subtitle: `${order.company || order.details} - $${(order.net || 0).toLocaleString()}`,
          action: () => onNavigate(`orders/${order.orderNumber}`),
          dueDate: 'Pending'
        });
      });
    
    // Unspecified opportunities (need more info)
    opportunities
      .filter(opp => opp.stage === 'Discovery' && (!opp.discount || opp.discount === 'Undecided'))
      .slice(0, 2)
      .forEach(opp => {
        items.push({
          type: 'info',
          priority: 'low',
          title: `Complete details: ${opp.name || opp.project || 'Untitled'}`,
          subtitle: 'Missing pricing information',
          action: () => onNavigate('projects'),
          dueDate: 'When possible'
        });
      });
    
    return items
      .slice(0, 5)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [opportunities, orders, onNavigate]);

  if (tasks.length === 0) return null;

  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#6B7280'
  };

  return (
    <GlassCard theme={theme} className="p-4 mb-4" variant="elevated">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
          <Clock className="w-5 h-5" style={{ color: theme.colors.accent }} />
          Action Items
        </h3>
        <span 
          className="text-xs font-semibold px-2 py-1 rounded-full" 
          style={{ 
            backgroundColor: `${theme.colors.accent}20`, 
            color: theme.colors.accent 
          }}
        >
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={task.action}
            className="w-full text-left p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 mt-1 rounded-full" 
                style={{ 
                  backgroundColor: priorityColors[task.priority], 
                  width: '3px', 
                  height: '40px' 
                }} 
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.colors.textPrimary }}>
                  {task.title}
                </p>
                <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                  {task.subtitle}
                </p>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-semibold uppercase" 
                    style={{ color: priorityColors[task.priority] }}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                    • {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
};
