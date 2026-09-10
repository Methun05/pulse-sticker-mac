'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// Post-payment usage (Step 3: logo step)
interface LogoUploadSubmitProps {
  bidId: string;
  uploadToken: string;
  onSubmitted: () => void;
  initialFile?: File;
  value?: never;
  onChange?: never;
}

// Pre-payment usage (Step 1: form step)
interface LogoUploadValueProps {
  value: File | null;
  onChange: (file: File | null) => void;
  bidId?: never;
  uploadToken?: never;
  onSubmitted?: never;
  initialFile?: never;
}

type LogoUploadProps = LogoUploadSubmitProps | LogoUploadValueProps;

export function LogoUpload(props: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValueMode = 'value' in props && props.onChange !== undefined;

  // Generate preview from File in value mode
  useEffect(() => {
    if (isValueMode && props.value) {
      const url = URL.createObjectURL(props.value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (isValueMode && !props.value) {
      setPreview(null);
    }
  }, [isValueMode, props.value]);

  // Auto-upload initialFile in submit mode
  useEffect(() => {
    if (!isValueMode && 'initialFile' in props && props.initialFile) {
      upload(props.initialFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (!isValueMode) {
        formData.append('bidId', props.bidId);
        formData.append('uploadToken', props.uploadToken);
      }
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Upload failed');
        return;
      }
      if (!isValueMode) {
        props.onSubmitted();
      }
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }, [isValueMode, props]);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('PNG, JPG, or WEBP only');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('Max 500KB');
      return;
    }
    if (isValueMode) {
      props.onChange(file);
    } else {
      upload(file);
    }
  }, [isValueMode, props, upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const displayPreview = isValueMode ? preview : null;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-[var(--ink)] bg-[var(--surface)]'
            : 'border-[var(--hairline)] hover:border-[var(--ink)]'
        }`}
      >
        {uploading ? (
          <p className="text-sm text-[var(--ink-3)]">Uploading...</p>
        ) : displayPreview ? (
          <div className="flex items-center justify-center gap-3">
            <img src={displayPreview} alt="Logo" className="w-10 h-10 rounded object-contain" />
            <p className="text-sm text-[var(--ink-3)]">Click to replace</p>
          </div>
        ) : (
          <>
            <svg className="mx-auto mb-1.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p className="text-sm text-[var(--ink-3)]">Drop logo here or click to browse</p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">PNG, JPG, WEBP · Max 500KB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-[var(--red)] mt-1.5 px-1">{error}</p>}
    </div>
  );
}
