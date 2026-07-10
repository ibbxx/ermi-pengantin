import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  label?: string;
  className?: string;
}

export default function ImagePlaceholder({
  label = 'Belum ada gambar',
  className = '',
}: ImagePlaceholderProps) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-100 text-stone-400 ${className}`}>
      <ImageIcon className="h-6 w-6" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}
