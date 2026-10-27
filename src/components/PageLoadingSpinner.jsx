import React from 'react';

// Suspense fallback for code-split routes — same spinner treatment the app
// already uses while auth/public settings load.
export default function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}