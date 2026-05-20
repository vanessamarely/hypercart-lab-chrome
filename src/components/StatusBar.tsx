import React from 'react';
import { getFlags, getActiveFlags } from '@/lib/performance-flags';

export function StatusBar() {
  const flags = getFlags();
  const activeFlags = getActiveFlags();

  const urlParams = new URLSearchParams(window.location.search);
  const showStatus = import.meta.env.DEV || urlParams.get('debug') === '1';

  if (!showStatus) return null;

  return (
    <div className="status-bar">
      <span className="font-semibold">Active Flags:</span>{' '}
      {activeFlags.length === 0 ? (
        'None'
      ) : (
        activeFlags.map((flag, index) => (
          <span key={flag}>
            {flag}
            {index < activeFlags.length - 1 ? ', ' : ''}
          </span>
        ))
      )}{' '}
      <span className="ml-4">Total: {activeFlags.length}</span>
    </div>
  );
}