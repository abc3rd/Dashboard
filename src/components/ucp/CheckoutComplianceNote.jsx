import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, FileText } from 'lucide-react';

const SUPPORT_EMAIL = 'contact@omegaui.com';

// External Content Links Program — checkout & transaction compliance UI.
// Shown adjacent to purchase action buttons and on the post-checkout screen so
// refund terms, support contact, and the dispute-resolution path are visible
// right where the buyer commits to the purchase.
export default function CheckoutComplianceNote({ showRefund = true }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground space-y-3">
      {showRefund && (
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-brand mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold text-foreground">Refund policy.</span>{' '}
            Subscriptions renew automatically until you cancel. Cancelling stops
            future renewals but does not refund the current period. The Lifetime
            plan is a one-time purchase and is final, except where a refund is
            required by applicable law. Refunds, where available, are handled by
            the payment provider (Base44 Payments) under its refund policy and
            local law.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-brand" />
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-brand hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          <span className="sr-only">Customer support</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-brand" />
          <Link to="/Terms" className="text-brand hover:underline">
            Dispute resolution & Terms
          </Link>
        </span>
      </div>
    </div>
  );
}