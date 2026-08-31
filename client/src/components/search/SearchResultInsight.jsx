"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";

export function SearchResultInsight({ result }) {
  if (!result) return null;

  return (
    <div className="rounded-xl border border-green-100 bg-green-50/70 p-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-green-950">
            {result.interpretation}
          </p>
          {result.classification ? (
            <p className="mt-1 text-[12px] text-green-800">
              Likely match: {result.classification.crop}
              {result.classification.confidence
                ? ` ? ${result.classification.confidence} confidence`
                : ""}
            </p>
          ) : null}
          {result.suggestions?.length ? (
            <div className="mt-3 flex items-start gap-2 text-[12px] text-ink-600">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <ul className="space-y-1">
                {result.suggestions.map(suggestion => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
