import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeroResourceGuideProps {
  className?: string;
}

export function HeroResourceGuide({ className = '' }: HeroResourceGuideProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Hero Resource Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            📸 Hero Images
            <Badge variant="secondary">Recommended</Badge>
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Resolution: 1920x1080 or higher</li>
            <li>• Format: WebP (with JPEG fallback)</li>
            <li>• File size: Under 500KB</li>
            <li>• Content: High-quality, relevant to your brand</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            🎥 Hero Videos
            <Badge variant="outline">Advanced</Badge>
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Duration: 10-30 seconds</li>
            <li>• Format: MP4 (H.264) + WebM</li>
            <li>• File size: Under 5MB</li>
            <li>• Must include poster image</li>
            <li>• Seamless loop recommended</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">🚀 Performance Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use fetchpriority="high" for hero images</li>
            <li>• Preload critical resources</li>
            <li>• Reserve space to prevent layout shift</li>
            <li>• Consider lazy loading for non-critical media</li>
          </ul>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Current Setup:</strong> This demo includes placeholder files in 
            <code className="bg-background px-1 rounded">/src/assets/images/</code> and 
            <code className="bg-background px-1 rounded">/src/assets/video/</code>. 
            Replace these with your actual media files.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}