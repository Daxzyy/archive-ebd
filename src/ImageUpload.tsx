import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, AlertTriangle } from 'lucide-react';

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('https://upf.iyayn.web.id/uploadfile', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`Upload gagal: ${res.status}`);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rawUrl = doc.querySelector('#rawUrlLink')?.getAttribute('href');

  if (!rawUrl) throw new Error('URL tidak ditemukan di response');
  return rawUrl;
}

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  circle?: boolean;
}

export default function ImageUpload({ value, onChange, circle = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  }, [handle]);

  const containerClass = circle ? 'w-20 h-20 rounded-full' : 'w-full aspect-video rounded-xl';

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed transition-all duration-200 ${containerClass} ${
          dragging ? 'border-red-400/60 bg-red-400/5'
          : value ? 'border-white/10 bg-black'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
        }`}
      >
        {value && !uploading && (
          <img src={value} alt="preview" className={`w-full h-full ${circle ? 'object-cover' : 'object-contain'}`} />
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-2">
            <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
            <span className="text-[11px] text-white/40 font-medium">Uploading...</span>
          </div>
        )}
        {!value && !uploading && (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <Upload className={`text-white/20 ${circle ? 'w-5 h-5' : 'w-6 h-6'}`} />
            {!circle && <span className="text-[11px] text-white/20 font-medium text-center px-4">Klik atau drag foto ke sini</span>}
          </div>
        )}
        {value && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all group">
            <Upload className="w-5 h-5 text-white/0 group-hover:text-white/60 transition-all" />
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </div>
      )}
      {value && !uploading && (
        <button type="button" onClick={() => { onChange(''); setError(null); }}
          className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-red-400 transition-colors w-fit">
          <X className="w-3 h-3" />Hapus foto
        </button>
      )}
    </div>
  );
}
