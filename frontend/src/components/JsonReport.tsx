export function JsonReport({ title, data }: { title: string; data: unknown }) {
  return (
    <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <pre className="max-h-80 overflow-auto rounded bg-gray-950 p-3 text-xs text-green-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
