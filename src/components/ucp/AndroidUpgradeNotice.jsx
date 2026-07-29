import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

// Shown on the Pricing page when the app is running inside the Android TWA.
// Google Play policy requires Play Billing for digital goods consumed in-app;
// since this app uses Base44 Payments (Wix) for Omega Access, no purchase flow is
// offered inside the Play-distributed build. Entitlement is account-based, so a
// purchase completed on the website unlocks Omega Access here on next sign-in.
export default function AndroidUpgradeNotice() {
  const [copied, setCopied] = useState(false);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      toast.success('Link copied — open it in any web browser.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Type the address into a browser manually.');
    }
  };

  return (
    <Card className="border-border shadow-md max-w-xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-semibold text-foreground">Upgrade on the web</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In-app purchases aren't available in the Android app. To get Omega Access,
          open UCP AI Router in any web browser and complete checkout there. Your
          subscription is tied to your account, so once it's active, sign back in here
          and unlimited access unlocks automatically.
        </p>
        <div className="rounded-lg bg-muted border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Open this address in a browser:</p>
          <p className="text-sm font-mono text-foreground break-all select-all">{siteUrl}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleCopy}>
          {copied ? (
            <><Check className="w-4 h-4 mr-2" /> Copied</>
          ) : (
            <><Copy className="w-4 h-4 mr-2" /> Copy link</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}