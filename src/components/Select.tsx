import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
    registration?: UseFormRegisterReturn;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    registration,
    className,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className={cn(
                        "w-full px-4 py-2.5 rounded-xl border bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 appearance-none",
                        error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
                        className
                    )}
                    defaultValue=""
                    {...registration}
                    {...props}
                >
                    <option value="" disabled>Select {label}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
};
