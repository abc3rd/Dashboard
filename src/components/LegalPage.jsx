import React from 'react';

export default function LegalPage({ title, effectiveDate, intro, sections, contactEmail }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground">Last updated: {effectiveDate}</p>
          {intro && <p className="mt-4 text-muted-foreground leading-relaxed">{intro}</p>}
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                <span className="text-brand">{i + 1}.</span> {section.heading}
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                {section.paragraphs.map((p, j) =>
                  Array.isArray(p) ? (
                    <ul key={j} className="list-disc pl-5 space-y-1.5">
                      {p.map((li, k) => (
                        <li key={k}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{p}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        {contactEmail && (
          <div className="mt-12 p-5 rounded-xl bg-brand/5 border border-brand/20">
            <p className="text-sm text-muted-foreground">
              Questions about this document? Email us at{' '}
              <a href={`mailto:${contactEmail}`} className="text-brand font-medium hover:underline">
                {contactEmail}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}