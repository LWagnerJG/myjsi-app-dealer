# MyJSI Dealer App

A React + Vite application for JSI dealers.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

The app is configured for deployment on Vercel. Push to the `main` branch to trigger automatic deployment.

### Vercel Configuration
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

## Project Structure

```
src/
??? components/       # Reusable UI components
??? config/          # App configuration
??? constants/       # App constants
??? data/            # Mock data and data utilities
??? design-system/   # Design tokens, components, and styling
??? features/        # Feature-specific code
??? hooks/           # Custom React hooks
??? screens/         # Screen/page components
??? state/           # Global state management
??? styles/          # Global styles
??? utils/           # Utility functions
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Router** - Routing
