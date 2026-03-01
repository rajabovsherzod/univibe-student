import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { UploadCloud01, Trash01, LogOut01, XClose } from "@untitledui/icons";

interface FileUploadContextType {
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export const FileUploadRoot = ({
  children,
  accept,
  maxFiles,
  maxSize
}: {
  children: ReactNode;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}) => {
  return (
    <FileUploadContext.Provider value={{ accept, maxFiles, maxSize }}>
      <div className="w-full flex flex-col gap-4">
        {children}
      </div>
    </FileUploadContext.Provider>
  );
};

export const getReadableFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUploadDropZone = ({
  accept,
  hint,
  onDropFiles,
  onDropUnacceptedFiles,
}: {
  accept?: string;
  hint?: string;
  onDropFiles: (files: FileList | File[]) => void;
  onDropUnacceptedFiles?: (files: FileList | File[]) => void;
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useContext(FileUploadContext);
  const acceptStr = accept || context?.accept;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFiles = (files: File[]) => {
    const accepted: File[] = [];
    const unaccepted: File[] = [];

    files.forEach((file) => {
      // Basic mime type check for images if we passed image/*
      if (acceptStr && acceptStr.includes("image") && !file.type.startsWith("image/")) {
        unaccepted.push(file);
      } else {
        accepted.push(file);
      }
    });
    return { accepted, unaccepted };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const { accepted, unaccepted } = validateFiles(filesArray);

      if (accepted.length > 0) onDropFiles(accepted);
      if (unaccepted.length > 0 && onDropUnacceptedFiles) onDropUnacceptedFiles(unaccepted);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const { accepted, unaccepted } = validateFiles(filesArray);

      if (accepted.length > 0) onDropFiles(accepted);
      if (unaccepted.length > 0 && onDropUnacceptedFiles) onDropUnacceptedFiles(unaccepted);
    }
    // reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full px-6 py-10 transition-colors border-2 border-dashed rounded-xl cursor-pointer ${isDragActive
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
          : "border-border-secondary bg-bg-secondary hover:bg-bg-tertiary"
        }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptStr}
        className="hidden"
        onChange={handleChange}
      />
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-bg-primary border border-border-secondary shadow-sm">
        <UploadCloud01 className="size-6 text-fg-secondary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">
          Bosing yoki faylni shu yerga tashlang
        </p>
        {hint && <p className="text-xs text-fg-tertiary">{hint}</p>}
      </div>
    </div>
  );
};

export const FileUploadList = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-3 w-full">{children}</div>;
};

export const FileUploadListItemProgressBar = ({
  name,
  size,
  progress,
  failed,
  onDelete,
  onRetry,
}: {
  name: string;
  size: number;
  progress: number;
  failed?: boolean;
  onDelete: () => void;
  onRetry?: () => void;
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border-secondary bg-bg-secondary w-full group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium text-fg-primary truncate">{name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-tertiary">{getReadableFileSize(size)}</span>
            <span className="text-xs font-medium text-brand-600">{progress}%</span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-border-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${failed ? 'bg-error-500' : 'bg-brand-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-lg text-fg-quaternary hover:bg-bg-tertiary hover:text-error-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
      >
        <Trash01 className="size-5" />
      </button>
    </div>
  );
};

export const FileUpload = {
  Root: FileUploadRoot,
  DropZone: FileUploadDropZone,
  List: FileUploadList,
  ListItemProgressBar: FileUploadListItemProgressBar,
};
