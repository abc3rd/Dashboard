import React from 'react';
import ReactMarkdown from 'react-markdown';

const whitepaperContent = `# UCP AI Router — Technical White Paper

**Version:** 1.0
**Prepared by:** Omega UI, LLC
**Product:** UCP AI Router — Universal Command Protocol routing platform

---

## Executive Summary

UCP AI Router is an intelligent routing platform that orchestrates AI model queries with deterministic selection logic, data governance, and real-time performance monitoring. Rather than binding an application to a single large language model, UCP Router applies a transparent, rule-based policy — the **Universal Command Protocol (UCP)** packet — to route each prompt to the model best matched to its intent, length, and cost/quality profile.

The platform targets developers and teams who need reliable, cost-aware access to AI without the vendor lock-in and unpredictable spend associated with routing every request through a single premium model. A freemium subscription model ("Omega Access") makes the core routing capability free to evaluate while reserving unlimited, high-throughput processing for paid subscribers.

---

## 1. Problem Statement

Modern AI-powered applications face three recurring tensions:

1. **Model sprawl.** A growing catalog of models spans a spectrum from lightweight, low-latency responders to deep-reasoning, high-quality engines. Picking one model for every request is either expensive (always-premium) or underwhelming (always-cheap).

2. **Unpredictable cost.** Billing is driven by token volume, so routing every prompt — including trivial ones — through a premium model inflates spend without proportionate quality gains.

3. **Opaque routing.** Black-box "auto-routing" services select models in ways the operator cannot inspect or tune, making compliance, debugging, and cost attribution difficult.

UCP AI Router addresses these by making the routing decision **explicit, inspectable, and editable** through the UCP packet.

---

## 2. The Universal Command Protocol (UCP)

UCP is a small, declarative protocol that describes a routing job: what inputs are accepted, what models are available, and the ordered rules that decide which model handles a given prompt. A UCP packet is a self-contained JSON document:

\`\`\`json
{
  "ucp_version": "1.0",
  "command_type": "ai_router",
  "schema": {
    "inputs": ["prompt"],
    "outputs": ["final_answer", "chosen_model"]
  },
  "models": [
    { "id": "fast_model", "maxTokens": 512,  "costScore": 1, "qualityScore": 7 },
    { "id": "smart_model", "maxTokens": 4096, "costScore": 5, "qualityScore": 9 }
  ],
  "selection_policy": {
    "rules": [
      { "condition": { "prompt_length_lt": 100 }, "choose_model": "fast_model" },
      { "condition": { "prompt_length_gte": 100 }, "choose_model": "smart_model" }
    ],
    "fallback_model": "smart_model"
  }
}
\`\`\`

Three properties make UCP effective:

- **Deterministic.** Rules are evaluated in order; the first match wins, with a declared fallback. Routing is reproducible and explainable.
- **Composable.** Conditions support prompt-length thresholds and keyword matching, and the model list is pluggable so operators can add new models without changing routing code.
- **Auditable.** Every answered query stores the packet snapshot used, so the exact decision context is reconstructable from the query log.

---

## 3. System Architecture

UCP AI Router is a serverless, edge-deployed application with three layers.

### 3.1 Routing Core (Backend Function)

The \`ucpRouter\` backend function is the single source of truth for all actions:

- **\`getPacket\`** — returns the active router packet configuration.
- **\`updatePacket\`** — validates and persists an updated packet (admin only).
- **\`ask\`** — the primary action: applies selection policy, invokes the chosen model adapter, measures real response latency, and logs the result.
- **\`info\`** — service health and capability descriptor.

The \`ask\` pipeline executes:

1. **Identity & tier resolution.** Logged-in users are identified by their account; anonymous visitors are identified by a client-generated persistent session id (falling back to the request's IP address). Active subscribers ("Omega Access") are classified as \`pro\`; all others are \`free\`.
2. **Quota enforcement.** Free-tier queries are capped at a configurable daily limit (default 10). Counts are derived from the query log scoped to the caller's identity key; pro users bypass the limit.
3. **Model selection.** \`chooseModelForPrompt\` evaluates packet rules in order against prompt length and keywords, returning the fallback model if no rule matches.
4. **Model invocation.** The selected adapter calls the platform's LLM integration with a role-tuned system instruction:
   - **Fast model** — concise 1–3 sentence answer, no preamble.
   - **Smart model** — thorough, well-structured answer with context and a conclusion.
5. **Telemetry.** Real invocation latency is measured and the full response (answer, chosen model, confidence, latency, packet snapshot) is persisted to the \`QueryLog\` entity.

### 3.2 Data Model

Three entities underpin the platform:

- **\`RouterPacket\`** — the active UCP configuration. Administrator-only access (create/read/update/delete) so routing policy cannot be tampered with by end users.
- **\`QueryLog\`** — per-query telemetry: prompt, answer, chosen model, confidence, latency, and an anonymous \`session_id\` key for free-tier quota attribution. Row-level security restricts users to their own logs; admins see all.
- **\`Subscription\`** — Omega Access purchase state (\`pending\` → \`active\` → \`canceled\`/\`ended\`), linked to the buyer's email and the checkout session.

### 3.3 Presentation Layer

A responsive React interface serves desktop browsers and an Android-optimized WebView with system dark-mode sync, safe-area padding, and a bottom tab bar. Key surfaces:

- **Ask** — prompt entry with a live routing indicator, answer card with confidence and packet inspection, and an inline free-tier quota meter.
- **Monitoring** — model-usage distribution, latency statistics, and projected cost-savings dashboards fed by the query log.
- **Router Packet** — a visual editor for selection rules and model registry, plus a raw-JSON view.
- **Pricing** — the Omega Access plans and checkout entry point.
- **API Docs** — developer reference for invoking the router programmatically.

---

## 4. Freemium Model — Omega Access

UCP AI Router ships with a Pro-Utility freemium structure.

- **Free tier.** Core routing, limited to a daily query budget (default 10). No account is required — a persistent client session id entitles anonymous visitors to the same daily allowance so the product can be evaluated without friction.
- **Omega Access (Pro).** Unlimited routing, including unlimited high-throughput processing. Available as monthly or annual plans through Base44 Payments (powered by Wix Payments).

The free-tier daily counter resets at the start of the caller's local day and is enforced server-side from the query log, so the limit cannot be bypassed by clearing client state — the count is authoritative.

---

## 5. Security & Governance

- **Frame-embedding protection.** The application refuses to render inside an iframe, mitigating clickjacking and spoofed-page attacks.
- **Row-level security.** QueryLog, RouterPacket, and Subscription enforce isolation: users see only their own queries and subscriptions; only administrators manage routing packets and all-subscription records.
- **Origin validation.** Checkout callbacks are validated against a trusted origin allowlist (derived from the Host header when no allowlist is set) to prevent open redirects.
- **Service-role logging.** Anonymous (unauthenticated) requests perform query logging and quota reads through the service role, since anonymous callers cannot pass user-scoped row-level security.
- **No plaintext secrets in client code.** Payment API keys and webhook signing keys are stored as platform secrets and referenced by name only in backend functions.

---

## 6. Performance Monitoring

Every answered query contributes to the monitoring dataset. Aggregations delivered to operators include:

- **Model utilization** — share of queries routed to each model, surfacing whether the fast/smart split matches expectations.
- **Latency statistics** — per-model response time, measured from the real LLM call rather than a synthetic delay.
- **Estimated cost savings** — the difference between always-premium routing and the packet's actual cost-aware selections, expressed as an efficiency index.

These metrics let operators tune the packet — for example, widening the fast model's length threshold when utilization data shows short prompts dominate.

---

## 7. Public API

The router is callable as a backend function over the platform's function invocation interface. A minimal \`ask\` request:

\`\`\`json
{
  "action": "ask",
  "prompt": "Summarize the CAP theorem.",
  "session_id": "<optional-anonymous-id>"
}
\`\`\`

A successful response returns the answer, chosen model, confidence, latency, and the packet snapshot used. On quota exhaustion the service responds with an identifiable error code (\`free_limit_reached\`) and a human-readable message, so client applications can branch directly to an upgrade flow.

---

## 8. Conclusion

UCP AI Router brings deterministic, inspectable routing to AI workloads. By externalizing the selection policy into an editable UCP packet, the platform turns model choice from a hidden, one-time decision into a tunable, auditable operational parameter — while a frictionless free tier and transparent monitoring lower the barrier to adoption. The result is a routing layer that is cheaper to run, easier to reason about, and straightforward to extend as new models enter the market.

---

*© Omega UI, LLC. UCP and the Universal Command Protocol are product concepts of Omega UI, LLC. This document describes platform capabilities as of the stated version and is subject to change.*
`;

const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-2xl font-semibold text-foreground mt-10 mb-3" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold text-foreground mt-6 mb-2" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-foreground/90 leading-relaxed mb-4" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-1.5 text-foreground/90" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-foreground/90" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  a: ({ node, ...props }) => (
    <a className="text-brand hover:underline" target="_blank" rel="noreferrer" {...props} />
  ),
  hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-brand pl-4 italic text-muted-foreground my-4" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 border border-border" {...props} />
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = /language-/.test(className || '');
    return isBlock ? (
      <code className={`${className || ''} text-sm font-mono text-foreground`} {...props}>
        {children}
      </code>
    ) : (
      <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  table: ({ node, ...props }) => (
    <table className="w-full mb-4 border-collapse text-sm" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="border border-border p-2 text-left font-semibold bg-muted text-foreground" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border border-border p-2 text-foreground/90" {...props} />
  )
};

export default function WhitePaper() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <ReactMarkdown components={markdownComponents}>{whitepaperContent}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}