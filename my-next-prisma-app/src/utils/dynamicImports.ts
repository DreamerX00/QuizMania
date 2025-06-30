import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic imports for heavy components
export const DynamicHeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    ssr: false,
    loading: (): JSX.Element => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
  }
);

// Dynamic import for 3D components
export const DynamicThreeComponent = dynamic(
  () => import('@/components/ThreeComponent'),
  {
    ssr: false,
    loading: (): JSX.Element => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>,
  }
);

// Dynamic import for chart components
export const DynamicChartComponent = dynamic(
  () => import('@/components/ChartComponent'),
  {
    ssr: false,
    loading: (): JSX.Element => <div className="animate-pulse bg-gray-200 h-48 rounded"></div>,
  }
);

// Dynamic import for admin components
export const DynamicAdminComponent = dynamic(
  () => import('@/components/AdminComponent'),
  {
    ssr: false,
    loading: (): JSX.Element => <div className="animate-pulse bg-gray-200 h-40 rounded"></div>,
  }
);

// Generic dynamic import helper
export function createDynamicImport(
  importFn: () => Promise<any>,
  options: {
    ssr?: boolean;
    loading?: React.ComponentType;
  } = {}
) {
  return dynamic(importFn, {
    ssr: false,
    loading: (): JSX.Element => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
    ...options,
  });
} 