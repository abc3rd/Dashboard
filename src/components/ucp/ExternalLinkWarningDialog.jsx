import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

// Google Play External Content Links Program — pre-departure disclosure.
// Shown before ANY navigation that leaves AI Router for an external website
// (Wix checkout, mailto, external http(s) links). The full destination URL is
// shown so the user knows exactly where they are going, and navigation only
// fires after an explicit "Continue" tap — never automatically.
export default function ExternalLinkWarningDialog({ open, url, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel?.(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Leaving AI Router
          </DialogTitle>
          <DialogDescription>
            You are leaving AI Router to visit an external website. You will be
            redirected to the address shown below.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Destination URL</span>
          </div>
          <p
            className="text-sm font-mono text-foreground break-all select-all leading-relaxed"
            aria-label="Destination URL"
          >
            {url}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-h-[44px] sm:mt-0"
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} className="min-h-[44px]">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}