import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "../lib/utils";
import { Upload } from "lucide-react";

interface FileUploadProps {
    label: string;
    accept?: string;
    error?: string;
    registration?: UseFormRegisterReturn;
    className?: string;
    multiple?: boolean;
    selectedFiles?: FileList | null;
}

// Note: File inputs with React Hook Form need careful handling. 
// We'll rely on the native file input registered via ref, but style a label around it.
export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    accept,
    error,
    registration,
    className,
    multiple,
    selectedFiles
}) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label} <span className="text-red-500">*</span>
            </label>

            <div className={cn(
                "relative flex items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-xl bg-white/30 transition-all cursor-pointer group hover:bg-white/50",
                error ? "border-red-500 bg-red-50/50" : "border-gray-300 hover:border-blue-400",
                className
            )}>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept={accept}
                    multiple={multiple}
                    {...registration}
                />
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <Upload className={cn("w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors", error && "text-red-400")} />
                    <p className="text-sm text-gray-500 font-medium">
                        <span className="text-blue-600 group-hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {accept ? accept.split(',').join(', ') : "Any file"}
                    </p>
                </div>
            </div>
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}

            {/* Show selected files if any */}
            {selectedFiles && selectedFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {Array.from(selectedFiles).map((file, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
