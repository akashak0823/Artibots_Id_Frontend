import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    registration?: UseFormRegisterReturn;
    className?: string;
    wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    registration,
    className,
    wrapperClassName,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <input
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl border bg-white/50 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-200",
                    error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
                    className
                )}
                {...registration}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
};
