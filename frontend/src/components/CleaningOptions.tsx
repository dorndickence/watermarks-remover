"use client";

type Options = {
  nfkc: boolean;
  aggressive_homoglyphs: boolean;
  also_layer_a_text: boolean;
  strip_all_metadata: boolean;
  remove_pixel: "" | "ctrlregen" | "diffusion";
};

type CleaningOptionsProps = {
  options: Options;
  kind: string | undefined;
  onChange: (next: Options) => void;
};

export function CleaningOptions({ options, kind, onChange }: CleaningOptionsProps) {
  const update = <K extends keyof Options>(key: K, value: Options[K]) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold">Cleaning options</h2>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={options.nfkc} onChange={(event) => update("nfkc", event.target.checked)} />
        Layer A Unicode normalization (NFKC)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.aggressive_homoglyphs}
          onChange={(event) => update("aggressive_homoglyphs", event.target.checked)}
        />
        Layer A aggressive homoglyph cleanup
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.also_layer_a_text}
          onChange={(event) => update("also_layer_a_text", event.target.checked)}
        />
        Container text Layer A cleaning
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={options.strip_all_metadata}
          onChange={(event) => update("strip_all_metadata", event.target.checked)}
        />
        Strip non-AI metadata (image mode)
      </label>

      {kind === "image" ? (
        <div className="space-y-1 text-sm">
          <label className="font-medium" htmlFor="pixel-removal">
            Pixel removal backend
          </label>
          <select
            id="pixel-removal"
            value={options.remove_pixel}
            onChange={(event) => update("remove_pixel", event.target.value as "" | "ctrlregen" | "diffusion")}
            className="w-full rounded border border-gray-300 px-2 py-1"
          >
            <option value="">None</option>
            <option value="ctrlregen">CtrlRegen</option>
            <option value="diffusion">MarkDiffusion</option>
          </select>
        </div>
      ) : null}
    </section>
  );
}
