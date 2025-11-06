import dynamic from "next/dynamic";
import React from "react";

// Loading component helper
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
  </div>
);

// Generic dynamic import helper
export function createDynamicImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    ssr?: boolean;
    loading?: React.ComponentType;
  } = {}
) {
  return dynamic(importFn, {
    ssr: options.ssr ?? false,
    loading: options.loading
      ? () => React.createElement(options.loading!)
      : () => <LoadingSpinner />,
  });
}
