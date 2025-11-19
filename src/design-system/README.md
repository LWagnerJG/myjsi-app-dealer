# Design System & Enhanced UI Components

This directory contains the unified design system tokens and enhanced UI components for the dealer app.

## Design Tokens (`tokens.js`)

Centralized design tokens for consistent styling across the application.

### Available Tokens

**Spacing:**
- `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- Usage: `spacing('md')` ? `'1rem'`

**Border Radius:**
- `sm`, `md`, `lg`, `xl`, `2xl`, `full`
- Usage: `radius('lg')` ? `'16px'`

**Shadows:**
- `sm`, `md`, `lg`, `xl`, `2xl`
- Usage: `shadow('md')` ? `'0 4px 6px rgba(0,0,0,0.07)'`

**Transitions:**
- `fast`, `normal`, `slow`
- Usage: `transition('normal')` ? `'300ms cubic-bezier(0.4, 0, 0.2, 1)'`

**Status Styles:**
- `success`, `warning`, `error`, `info`, `pending`
- Includes light and dark mode variants

## Enhanced Components

### StatusBadge
Visual indicators for different states with icons.

```jsx
import { StatusBadge } from '../components/common/StatusBadge';

<StatusBadge status="success" label="Completed" size="md" />
<StatusBadge status="warning" label="Pending" size="sm" showIcon={false} />
```

**Predefined Variants:**
- `OrderStatusBadge` - For order states
- `ProjectStatusBadge` - For project stages

### EmptyState
Engaging empty state screens with illustrations and actions.

```jsx
import { EmptyState } from '../components/common/EmptyState';

<EmptyState
  icon={Users}
  title="No customers yet"
  description="Start by adding your first customer."
  action={{ label: "Add Customer", onClick: handleAdd }}
  theme={theme}
/>
```

**Predefined Variants:**
- `NoCustomersEmptyState`
- `NoProjectsEmptyState`
- `NoOrdersEmptyState`
- `SearchEmptyState`

### AnimatedNumber
Smooth number counting animations.

```jsx
import { AnimatedNumber, AnimatedCurrency } from '../components/common/AnimatedNumber';

<AnimatedNumber value={12500} duration={1000} />
<AnimatedCurrency value={12500} showCents={false} />
<AnimatedPercentage value={75.5} decimals={1} />
```

### TabBar
Enhanced tab navigation with animations.

```jsx
import { TabBar, SegmentedControl } from '../components/navigation/TabBar';

<TabBar
  tabs={[
    { key: 'all', label: 'All', icon: List },
    { key: 'active', label: 'Active', icon: CheckCircle }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  theme={theme}
  variant="pills" // or "underline"
/>
```

### FloatingActionButton
Prominent action button for primary tasks.

```jsx
import { FloatingActionButton } from '../components/common/FloatingActionButton';

<FloatingActionButton
  icon={Plus}
  label="New Project"
  onClick={handleCreate}
  position="bottom-right"
  theme={theme}
/>
```

## Usage Guidelines

### Importing Design Tokens

```jsx
import { DESIGN_TOKENS, spacing, radius, shadow } from '../design-system';

// Use in styles
<div style={{
  padding: spacing('md'),
  borderRadius: radius('lg'),
  boxShadow: shadow('md')
}} />
```

### Importing Components

```jsx
// Individual imports
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

// Or from enhanced index
import { 
  StatusBadge, 
  EmptyState, 
  AnimatedNumber 
} from '../components/common/enhanced';
```

## Benefits

1. **Consistency** - Unified design language across all screens
2. **Maintainability** - Single source of truth for design decisions
3. **Flexibility** - Easy to update themes and styles globally
4. **Performance** - Optimized animations with proper easing
5. **Accessibility** - Built with a11y best practices

## Future Enhancements

- [ ] Add more animation presets
- [ ] Create loading skeleton components
- [ ] Add toast notification system
- [ ] Implement pull-to-refresh
- [ ] Add swipeable card actions
- [ ] Create advanced search with filters
