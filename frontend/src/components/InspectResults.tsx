import { JsonReport } from "@/components/JsonReport";

type InspectResult = {
  kind?: string;
  suspicious?: boolean;
  report?: Record<string, unknown>;
};

export function InspectResults({ result }: { result: InspectResult | null }) {
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <p>
          Detected kind: <span className="font-semibold">{result.kind ?? "unknown"}</span>
        </p>
        <p>
          Suspicious: <span className="font-semibold">{result.suspicious ? "Yes" : "No"}</span>
        </p>
      </section>
      <JsonReport title="Inspection report" data={result.report ?? {}} />
    </div>
  );
}
