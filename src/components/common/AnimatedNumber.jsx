import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedNumber = ({ 
  value, 
  duration = 1000, 
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
  style = {}
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    let animationFrame = null;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = easeOut * value;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };
  
  return (
    <span className={className} style={style}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

// Specialized component for currency
export const AnimatedCurrency = ({ 
  value, 
  duration = 1000,
  showCents = false,
  className = '',
  style = {}
}) => {
  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      decimals={showCents ? 2 : 0}
      prefix="$"
      className={className}
      style={style}
    />
  );
};

// Specialized component for percentages
export const AnimatedPercentage = ({ 
  value, 
  duration = 1000,
  decimals = 1,
  className = '',
  style = {}
}) => {
  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      decimals={decimals}
      suffix="%"
      className={className}
      style={style}
    />
  );
};

// Counter with framer-motion spring
export const SpringCounter = ({ 
  value, 
  className = '',
  style = {}
}) => {
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30,
    mass: 0.8
  });
  
  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString()
  );
  
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  
  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
};
