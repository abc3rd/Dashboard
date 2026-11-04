import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, FileText } from 'lucide-react';

// External Content Links Program — checkout & transaction compliance UI.
// Shown adjacent to purchase action buttons and on the post-checkout screen so
// refund terms, support contact, and the dispute-resolution path are visible
// right where the buyer commits to the purchase.
export default function CheckoutComplianceNote({ showRefund = true, plan }) {
  return (
    <aside aria-label="Refund policy and customer support" className="mt-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground space-y-3">
      {showRefund && (
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-brand mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold text-foreground">Refund policy.</span>{' '}
            Subscriptions renew automatically until cancelled. Cancellation stops future renewals but does not refund the current paid period, except where required by applicable law.
            {' '}<Link to="/Terms#refunds" className="text-brand underline">Full refund terms</Link>
          </p>
        </div>
      )}
      <p><span className="font-semibold text-foreground">Dispute an unauthorized charge:</span> Contact support with the order reference, charge date, amount and a description of the issue. Do not send passwords or full card details. If unresolved, contact your card issuer about its dispute process.</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to="/Contact" className="inline-flex min-h-11 items-center gap-1.5 text-brand underline"><Mail className="h-4 w-4" aria-hidden="true" />Customer support</Link>
        <Link to="/Terms#disputes" className="inline-flex min-h-11 items-center gap-1.5 text-brand underline"><FileText className="h-4 w-4" aria-hidden="true" />Dispute resolution</Link>
      </div>
    </aside>
  );
}