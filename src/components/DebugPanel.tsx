import React, { useState, useEffect } from 'react';
import { X, Gear } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getFlags, setFlag, getActiveFlagCount } from '@/lib/performance-flags';
import type { PerformanceFlags } from '@/lib/types';
import {
  injectThirdPartyScript,
  removeThirdPartyScript,
  loadExtraCSS,
  removeExtraCSS,
  addFontPreconnect,
  removeFontPreconnect,
} from '@/lib/performance-utils';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FLAG_GROUPS = {
  'LCP/CLS': [
    { key: 'heroPreload', label: 'Hero Preload', description: 'Preload hero image' },
    { key: 'heroFetchPriorityHigh', label: 'Hero Fetch Priority', description: 'High priority fetch' },
    { key: 'fontPreconnect', label: 'Font Preconnect', description: 'Preconnect to fonts' },
    { key: 'reserveHeroSpace', label: 'Reserve Hero Space', description: 'Fixed hero dimensions' },
    { key: 'lateBanner', label: 'Late Banner', description: 'Banner causes CLS' },
  ],
  'Coverage/Network': [
    { key: 'injectThirdParty', label: 'Third Party Script', description: 'Heavy blocking script' },
    { key: 'loadExtraCSS', label: 'Extra CSS', description: 'Unused CSS rules' },
    { key: 'lazyOff', label: 'Disable Lazy Loading', description: 'Load all images eagerly' },
  ],
  'INP/Long Tasks': [
    { key: 'listenersPassive', label: 'Passive Listeners', description: 'Use passive event listeners' },
    { key: 'simulateLongTask', label: 'Simulate Long Task', description: 'Block main thread 120ms' },
    { key: 'useWorker', label: 'Use Worker', description: 'Move work to worker thread' },
  ],
  'Search/Input': [
    { key: 'debounce', label: 'Debounce Input', description: 'Debounce search input' },
    { key: 'microYield', label: 'Micro Yield', description: 'Yield between chunks' },
  ],
  'CLS/UX': [
    { key: 'missingSizes', label: 'Missing Image Sizes', description: 'Images without dimensions' },
    { key: 'intrinsicPlaceholders', label: 'Intrinsic Placeholders', description: 'Use content-visibility' },
  ],
} as const;

export function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const [flags, setFlags] = useState<PerformanceFlags>(getFlags());

  useEffect(() => {
    const handleStorageChange = () => {
      setFlags(getFlags());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggle = (key: keyof PerformanceFlags) => {
    const newValue = !flags[key];
    setFlag(key, newValue);
    setFlags(prev => ({ ...prev, [key]: newValue }));

    // Handle side effects
    if (key === 'injectThirdParty') {
      if (newValue) {
        injectThirdPartyScript();
      } else {
        removeThirdPartyScript();
      }
    }

    if (key === 'loadExtraCSS') {
      if (newValue) {
        loadExtraCSS();
      } else {
        removeExtraCSS();
      }
    }

    if (key === 'fontPreconnect') {
      if (newValue) {
        addFontPreconnect();
      } else {
        removeFontPreconnect();
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="debug-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(FLAG_GROUPS).map(([groupName, groupFlags]) => (
          <Card key={groupName} className="p-4">
            <h4 className="font-medium mb-3 text-primary">{groupName}</h4>
            <div className="space-y-3">
              {groupFlags.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  <Switch
                    checked={flags[key as keyof PerformanceFlags]}
                    onCheckedChange={() => handleToggle(key as keyof PerformanceFlags)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DebugToggleButton() {
  const [visible, setVisible] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button only when debug=1 is in URL
    const urlParams = new URLSearchParams(window.location.search);
    setShowButton(urlParams.get('debug') === '1');

    // Update active count
    const updateCount = () => setActiveCount(getActiveFlagCount());
    updateCount();

    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  if (!showButton) return null;

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setVisible(!visible)}
        data-cy="debug-toggle"
      >
        <Gear size={20} />
        {activeCount > 0 && (
          <Badge className="absolute -top-2 -right-2 min-w-5 h-5 text-xs">
            {activeCount}
          </Badge>
        )}
      </Button>

      <DebugPanel visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}