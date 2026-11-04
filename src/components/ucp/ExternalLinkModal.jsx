import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import CheckoutComplianceNote from '@/components/ucp/CheckoutComplianceNote';

export default function ExternalLinkModal({ open, url, purpose, onConfirm, onCancel, onCloseAutoFocus }) {
  const cancelRef = useRef(null);
  const contact = /^(mailto:|tel:|sms:)/i.test(url || '');
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onCancel(); }}>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto" onOpenAutoFocus={(event) => { event.preventDefault(); cancelRef.current?.focus(); }} onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>Leaving AI Router</DialogTitle>
          <DialogDescription>You are leaving AI Router to visit an external website.</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-foreground">
          {purpose === 'checkout'
            ? 'Purpose: Complete your Omega Access purchase through Base44 Payments, outside Google Play.'
            : contact ? 'Purpose: Open your email, phone or messaging app. If you copied a support message, paste it there.'
            : 'Purpose: View the destination website outside AI Router.'}
        </p>
        <div className="min-w-0 rounded-lg border border-border bg-muted p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />Destination URL</p>
          <p dir="ltr" tabIndex={0} className="break-all whitespace-pre-wrap select-text font-mono text-sm leading-relaxed text-foreground" aria-label="Full destination URL">{url}</p>
        </div>
        {purpose === 'checkout' && <CheckoutComplianceNote />}
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onConfirm} className="h-auto min-h-11 w-full whitespace-normal">Continue to External Site</Button>
          <Button ref={cancelRef} variant="outline" onClick={onCancel} className="min-h-11 w-full">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}