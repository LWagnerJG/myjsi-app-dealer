import React from 'react';
import { motion } from 'framer-motion';
import { radius } from '../../design-system/tokens.js';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  illustration,
  theme 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon or Illustration */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon && (
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ 
            backgroundColor: `${theme.colors.accent}15`,
            borderRadius: radius('full')
          }}
        >
          <Icon className="w-10 h-10" style={{ color: theme.colors.accent }} />
        </motion.div>
      )}
      
      {/* Title */}
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-bold text-xl mb-2" 
        style={{ color: theme.colors.textPrimary }}
      >
        {title}
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm mb-8 max-w-sm leading-relaxed" 
        style={{ color: theme.colors.textSecondary }}
      >
        {description}
      </motion.p>
      
      {/* Action Button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={action.onClick}
          className="px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: theme.colors.accent,
            borderRadius: radius('full')
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

// Predefined empty states for common scenarios
export const NoCustomersEmptyState = ({ theme, onAddCustomer }) => (
  <EmptyState
    icon={require('lucide-react').Users}
    title="No customers yet"
    description="Start building relationships by adding your first customer. You'll be able to track projects, orders, and communications all in one place."
    action={{
      label: "Add First Customer",
      onClick: onAddCustomer
    }}
    theme={theme}
  />
);

export const NoProjectsEmptyState = ({ theme, onCreateProject }) => (
  <EmptyState
    icon={require('lucide-react').Briefcase}
    title="No projects found"
    description="Create your first project to start tracking opportunities, timelines, and progress toward your sales goals."
    action={{
      label: "Create Project",
      onClick: onCreateProject
    }}
    theme={theme}
  />
);

export const NoOrdersEmptyState = ({ theme }) => (
  <EmptyState
    icon={require('lucide-react').Package}
    title="No orders yet"
    description="Orders will appear here once customers place them. Check back soon or create a new project to get started."
    theme={theme}
  />
);

export const SearchEmptyState = ({ theme, searchTerm }) => (
  <EmptyState
    icon={require('lucide-react').Search}
    title="No results found"
    description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search or filters.`}
    theme={theme}
  />
);
