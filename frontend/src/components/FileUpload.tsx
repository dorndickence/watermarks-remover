"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  file: File | null;
  onFileSelected: (file: File) => void;
};

const ACCEPTED_TYPES = ".txt,.md,.html,.png,.jpg,.jpeg,.svg,.pdf,.docx";

export function FileUpload({ file, onFileSelected }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (inputFile: File | undefined) => {
    if (!inputFile) {
      return;
    }
    onFileSelected(inputFile);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          pickFile(event.dataTransfer.files[0]);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <p className="text-sm font-medium text-gray-700">Drag and drop a file, or click to upload</p>
        <p className="mt-2 text-xs text-gray-500">Supported: PNG, JPEG, SVG, PDF, DOCX, HTML, MD, TXT</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => pickFile(event.target.files?.[0])}
      />
      {file ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      ) : null}
    </div>
  );
}
