import { UploadCloud } from "lucide-react";

export function UploadZone({
  onFileSelect,
  uploading,
}: {
  onFileSelect: (file: File | null) => void;
  uploading: boolean;
}) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-10 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20">
      <UploadCloud className="mb-3 h-8 w-8 text-blue-600" />
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {uploading ? "Uploading contract..." : "Drop your contract here or click to browse"}
      </p>
      <p className="mt-1 text-sm text-slate-500">Supports PDF, DOCX, JPG, PNG</p>
      <input
        type="file"
        name="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
