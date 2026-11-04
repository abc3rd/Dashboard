import React from 'react';
import LegalPage from '@/components/LegalPage';

const CONTACT_EMAIL = 'contact@omegaui.com';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="November 4, 2026"
      intro={`This Privacy Policy explains how Omega UI, LLC ("we", "us") collects, uses, and protects your information when you use the Deterministic Dashboard application (the "Service"). We are committed to transparency and to giving you control over your data.`}
      contactEmail={CONTACT_EMAIL}
      sections={[
        {
          id: 'information-we-collect',
          heading: 'Information We Collect',
          paragraphs: [
            'We only collect the information needed to provide and secure the Service. We do not request or collect your precise location, contacts, photos, camera, microphone or audio recordings, health, or financial account credentials.',
            [
              'Account information: Your email address and name, provided when you create an account through our authentication provider (Base44).',
              'Query data: The prompts you submit, the AI responses returned, the model selected, confidence scores, and response timing. This is linked to your account and, by default, visible only to you. Administrators may access records as needed to operate, secure, and maintain the Service.',
              'Subscription and payment data: Your email, selected plan, and subscription status, plus identifiers returned by our payment provider (Base44 Payments, powered by Wix). We do not collect, store, or process full card numbers — these are handled directly by the payment provider.',
              'Anonymous session identifier: A randomly generated identifier stored locally when you use the free tier without signing in. It is used only for rate limiting and is not linked to your account or identity.',
              'Technical and usage data: Basic device and browser information, authentication tokens, service interaction logs, and limited analytics events (such as feature usage and conversion) used for security, reliability, abuse prevention, and product improvement.',
            ],
          ],
        },
        {
          id: 'how-we-use',
          heading: 'How We Use Your Information',
          paragraphs: [
            'We use your information to:',
            [
              'Provide, operate, and maintain the routing service and your account.',
              'Process payments and manage your subscription, including renewal and cancellation.',
              'Route your prompts to the selected AI model and return responses to you.',
              'Monitor performance, detect and prevent abuse, and secure the Service.',
              'Improve quality, fix issues, and develop new features.',
              'Communicate with you about your account, security, and required legal disclosures.',
              'Collect limited analytics events to understand feature usage and measure conversions, subject to your cookie consent choice.',
              'Comply with legal obligations.',
            ],
          ],
        },
        {
          id: 'data-isolation',
          heading: 'Data Isolation and Per-Account Access',
          paragraphs: [
            'Your data is isolated to your account. We enforce strict row-level access controls so that each user can only read and manage their own query logs, subscription, and account data.',
            [
              'Query logs: Only you and authorized administrators can view your logs. Other users cannot access them under any circumstance.',
              'Subscriptions: Only you and authorized administrators can view your subscription details.',
              'Router packets: Router configuration and packet data are restricted to administrators only.',
              'Administrators: Administrators can access all records as needed to operate, secure, and maintain the Service. They cannot see your password or payment card details, which are handled exclusively by our authentication and payment providers.',
            ],
            'Free-tier users who submit queries without signing in are identified only by an anonymous session identifier for rate limiting. This identifier is not linked to any account or personal data.',
          ],
        },
        {
          id: 'legal-bases',
          heading: 'Legal Bases (EEA, UK, and similar regions)',
          paragraphs: [
            'For users in regions with comprehensive privacy laws, we process your data under the following bases:',
            [
              'Performance of a contract: to provide the Service you requested, including routing and subscriptions.',
              'Legitimate interests: to secure the Service, prevent abuse, and improve reliability.',
              'Consent: for any optional processing that requires it, which you may withdraw at any time.',
              'Legal obligation: to comply with applicable law.',
            ],
          ],
        },
        {
          id: 'how-we-share',
          heading: 'How We Share Information',
          paragraphs: [
            'We do not sell your personal information. We share data only with the processors that operate the Service:',
            [
              'Base44: our application platform and hosting provider, which manages authentication, the database, and backend functions.',
              'Base44 Payments (powered by Wix): our payment processor for subscriptions.',
              'AI model providers: your prompts are sent to the selected model to generate responses. Outputs depend on each provider\u2019s terms.',
              'Service infrastructure providers that support hosting, analytics, and security.',
            ],
            'We may also disclose information when required by law, court order, or to protect the rights, property, or safety of our users or others.',
          ],
        },
        {
          id: 'data-retention',
          heading: 'Data Retention',
          paragraphs: [
            'We keep your data only as long as needed to provide the Service and comply with legal obligations:',
            [
              'Query logs are retained while your account is active and are removed when you delete your account.',
              'Subscription records are kept while your subscription is active and for the period required for accounting and legal compliance.',
              'You can delete your account and associated query data at any time using the Delete Account option in the app. Deleting your account permanently removes your query logs and personal data from our systems.',
              'Anonymous session identifiers used for free-tier rate limiting are kept only for the period needed to enforce rate limits and are then discarded.',
            ],
          ],
        },
        {
          id: 'security',
          heading: 'Data Security',
          paragraphs: [
            'We protect your data using measures such as row-level access controls, encrypted data in transit (TLS), and strict access management. No method of transmission or storage is completely secure, but we work to protect your information using industry-standard safeguards.',
          ],
        },
        {
          id: 'your-rights',
          heading: 'Your Privacy Rights',
          paragraphs: [
            'Depending on your location, you may have the right to:',
            [
              'Access the personal data we hold about you.',
              'Correct inaccurate information.',
              'Delete your data and account, including via the in-app Delete Account feature.',
              'Object to or restrict certain processing.',
              'Withdraw consent where processing was based on consent.',
            ],
            'To exercise any of these rights, contact us at the email below. We will respond within the timeframe required by applicable law.',
          ],
        },
        {
          id: 'children',
          heading: 'Children\u2019s Privacy',
          paragraphs: [
            'The Service is not directed to children under 13 (or under 16 in regions where that applies). We do not knowingly collect personal information from children. If you believe a child has provided us data, contact us and we will delete it.',
          ],
        },
        {
          id: 'international-transfers',
          heading: 'International Data Transfers',
          paragraphs: [
            'Your information may be processed and stored in the United States or other regions where our providers operate. We rely on appropriate safeguards, such as standard contractual clauses, where required for transfers outside your region.',
          ],
        },
        {
          id: 'cookies-storage',
          heading: 'Cookies and Consent',
          paragraphs: [
            'We use minimal local storage and authentication tokens to keep you signed in and operate the Service. A cookie consent banner lets you accept or decline optional analytics storage; your choice is reported through Google Consent Mode v2 and stored locally so the banner does not reappear. You can change your choice at any time using the "Cookie Settings" link in the footer. We do not use advertising cookies or track you across third-party sites.',
          ],
        },
        {
          id: 'changes',
          heading: 'Changes to This Policy',
          paragraphs: [
            'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date above. Material changes will be communicated through the Service. Continued use after changes take effect constitutes acceptance of the updated policy.',
          ],
        },
        {
          id: 'contact',
          heading: 'Contact Us',
          paragraphs: [
            `If you have questions about this Privacy Policy or your data, contact us at ${CONTACT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}