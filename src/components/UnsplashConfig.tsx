import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { Info, Key, Image } from '@phosphor-icons/react';

export function UnsplashConfig() {
  const [apiKey, setApiKey] = useKV('unsplash-api-key', '');
  const [tempKey, setTempKey] = useState(apiKey || '');

  const handleSave = () => {
    setApiKey(tempKey);
  };

  const handleClear = () => {
    setApiKey('');
    setTempKey('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Unsplash Image Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Image Source Information:</p>
            <p>
              This app uses Unsplash's free image service by default. You can optionally provide 
              an Unsplash API key for higher quality images and more reliable service.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Unsplash API Key (Optional)</label>
            {apiKey && <Badge variant="secondary" className="text-xs">Configured</Badge>}
          </div>
          
          <Input
            type="password"
            placeholder="Enter your Unsplash Access Key"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              size="sm"
              disabled={tempKey === apiKey}
            >
              Save Key
            </Button>
            {apiKey && (
              <Button 
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear Key
              </Button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>How to get an API key:</strong> Visit{' '}
            <a 
              href="https://unsplash.com/developers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              unsplash.com/developers
            </a>
            {' '}→ Create an app → Copy your "Access Key"
          </p>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            <strong>Current mode:</strong> {apiKey ? 'Official API' : 'Unsplash Source (free)'} • 
            Images are cached for better performance
          </p>
        </div>
      </CardContent>
    </Card>
  );
}