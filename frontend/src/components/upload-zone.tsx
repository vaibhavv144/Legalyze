import { UploadCloud } from "lucide-react";

export function UploadZone({
  onFileSelect,
  uploading,
}: {
  onFileSelect: (file: File | null) => void;
  uploading: boolean;
}) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d6d3cc] bg-[#fcfbf9] p-12 text-center transition-colors duration-200 hover:border-[#0c0b0a] hover:bg-[#f6f4ef]">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-[#e8e6e1] bg-white text-[#161513] transition-colors duration-200 group-hover:border-[#0c0b0a] group-hover:bg-[#0c0b0a] group-hover:text-white">
        <UploadCloud className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <p className="font-semibold text-[#161513]">
        {uploading ? "Uploading contract..." : "Drop your contract here, or click to browse"}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#a8a39a]">
        PDF · DOCX · JPG · PNG
      </p>
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
