import { ImageIcon } from "lucide-react";
import Image from "next/image";

export function PhotoPreview({ previewUrl, filename, onLoad, onError }: {
  previewUrl: string | null;
  filename: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-alt">
      {previewUrl ? <Image src={previewUrl} alt={`Preview of ${filename}`} fill unoptimized sizes="(max-width: 767px) 50vw, 320px" className="object-contain" onLoad={onLoad} onError={onError} />
        : <div role="img" aria-label={`Placeholder for ${filename}`} className="flex h-full flex-col items-center justify-center gap-2 p-3 text-secondary-text"><ImageIcon size={28} aria-hidden="true" /><span className="text-center text-xs">Sample photo</span></div>}
    </div>
  );
}
