"use client";

import { useEffect, useMemo, useState } from "react";

import { CleaningOptions } from "@/components/CleaningOptions";
import { CreditsModal } from "@/components/CreditsModal";
import { FileUpload } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { InspectResults } from "@/components/InspectResults";
import { JsonReport } from "@/components/JsonReport";
import { useCredits } from "@/context/CreditsContext";
import { base64ToBytes, bytesToBase64 } from "@/lib/base64";
import { cleanFile, getHealth, inspectFile } from "@/services/watermarks-api";

const EMPTY_OPTIONS = {
  nfkc: true,
  aggressive_homoglyphs: false,
  also_layer_a_text: true,
  strip_all_metadata: true,
  remove_pixel: "" as "" | "ctrlregen" | "diffusion",
};

type InspectResult = { kind?: string; suspicious?: boolean; report?: Record<string, unknown> };
type CleanResult = { cleaned?: string; report?: Record<string, unknown>; kind?: string };

function getWarnings(report: Record<string, unknown> | undefined): string[] {
  if (!report) {
    return [];
  }
  const warnings: string[] = [];
  if (report.still_has_c2pa === true || report.still_has_ai_metadata === true) {
    warnings.push("Residual C2PA or AI metadata may remain.");
  }
  if (Array.isArray(report.post_findings) && report.post_findings.length > 0) {
    warnings.push(`Residual findings: ${report.post_findings.join(", ")}`);
  }
  if (typeof report.pixel_remove_warning === "string") {
    warnings.push(report.pixel_remove_warning);
  }
  return warnings;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [inspectResult, setInspectResult] = useState<InspectResult | null>(null);
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [status, setStatus] = useState<string>("Idle");
  const [error, setError] = useState<string>("");
  const [serviceVersion, setServiceVersion] = useState<string>("unknown");
  const [creditsOpen, setCreditsOpen] = useState(false);

  const { estimate, canAfford, deduct } = useCredits();
  const kind = (inspectResult?.kind as "text" | "image" | "container" | undefined) ?? undefined;

  const estimatedCost = useMemo(() => {
    if (!kind) {
      return 0;
    }
    return estimate(kind, { remove_pixel: options.remove_pixel });
  }, [estimate, kind, options.remove_pixel]);

  useEffect(() => {
    getHealth()
      .then((health) => setServiceVersion(health.version ?? "unknown"))
      .catch(() => setServiceVersion("unreachable"));
  }, []);

  const handleFileSelected = async (nextFile: File) => {
    setFile(nextFile);
    setStatus("Inspecting…");
    setError("");
    setInspectResult(null);
    setCleanResult(null);

    try {
      const buffer = await nextFile.arrayBuffer();
      const result = await inspectFile({
        file: bytesToBase64(new Uint8Array(buffer)),
        name: nextFile.name,
      });
      setInspectResult(result as InspectResult);
      setStatus("Inspection complete");
    } catch (inspectError) {
      setStatus("Inspection failed");
      setError(inspectError instanceof Error ? inspectError.message : "Inspection failed");
    }
  };

  const clean = async () => {
    if (!file || !kind) {
      return;
    }
    if (!canAfford(estimatedCost)) {
      setError("Insufficient credits for this operation. Open Credits to top up.");
      return;
    }

    setStatus("Cleaning…");
    setError("");

    try {
      const buffer = await file.arrayBuffer();
      const payloadOptions = {
        nfkc: options.nfkc,
        aggressive_homoglyphs: options.aggressive_homoglyphs,
        also_layer_a_text: options.also_layer_a_text,
        strip_all_metadata: options.strip_all_metadata,
        ...(options.remove_pixel ? { remove_pixel: options.remove_pixel } : {}),
      };

      const result = await cleanFile({
        file: bytesToBase64(new Uint8Array(buffer)),
        name: file.name,
        options: payloadOptions,
      });
      setCleanResult(result as CleanResult);
      deduct(estimatedCost, `Clean ${file.name}`);
      setStatus("Clean complete");
    } catch (cleanError) {
      setStatus("Clean failed");
      setError(cleanError instanceof Error ? cleanError.message : "Cleaning failed");
    }
  };

  const cleanedBlob = useMemo(() => {
    if (!cleanResult?.cleaned) {
      return null;
    }
    const bytes = base64ToBytes(cleanResult.cleaned);
    const normalized = Uint8Array.from(bytes);
    return new Blob([normalized]);
  }, [cleanResult]);

  const downloadUrl = useMemo(() => {
    if (!cleanedBlob) {
      return "";
    }
    return URL.createObjectURL(cleanedBlob);
  }, [cleanedBlob]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const warnings = getWarnings(cleanResult?.report);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header onOpenCredits={() => setCreditsOpen(true)} />
      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
        <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p>Backend service version: {serviceVersion}</p>
          <p>Status: {status}</p>
          {error ? <p className="mt-1 text-red-700">{error}</p> : null}
        </section>

        <FileUpload file={file} onFileSelected={handleFileSelected} />

        <div className="grid gap-4 md:grid-cols-2">
          <InspectResults result={inspectResult} />
          <CleaningOptions options={options} kind={kind} onChange={setOptions} />
        </div>

        {kind ? (
          <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <p>
              Estimated cost: <span className="font-semibold">{estimatedCost}</span> credit(s)
            </p>
            {!canAfford(estimatedCost) ? (
              <p className="text-red-700">Insufficient credits. Please top up in the Credits modal.</p>
            ) : null}
            <button
              type="button"
              onClick={clean}
              disabled={!file || !kind}
              className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Clean file
            </button>
          </section>
        ) : null}

        {cleanResult ? (
          <>
            <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p>Before size: {file ? formatBytes(file.size) : "n/a"}</p>
              <p>After size: {cleanedBlob ? formatBytes(cleanedBlob.size) : "n/a"}</p>
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download={file ? `${file.name}.cleaned` : "cleaned-file"}
                  className="mt-3 inline-block rounded bg-emerald-600 px-4 py-2 text-white"
                >
                  Download cleaned file
                </a>
              ) : null}
            </section>

            {warnings.length > 0 ? (
              <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                <h3 className="font-semibold">Residual-risk warnings</h3>
                <ul className="mt-2 list-disc pl-5">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <JsonReport title="Cleaning report" data={cleanResult.report ?? {}} />
          </>
        ) : null}
      </main>
    </div>
  );
}
